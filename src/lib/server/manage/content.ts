import { compile } from 'mdsvex'
import remarkGfm from 'remark-gfm'
import { stringify } from 'yaml'

import { postFrontmatterSchema } from '$lib/content/schema'
import { parseContentFrontmatter } from '$lib/server/content/frontmatter'
import { ManageError } from '$lib/server/manage/errors'
import type {
	ManageUploadedAsset,
	ManageWritePayload,
	ManagedPostFormat,
	RepoFileRecord,
	RepositoryManagedPost
} from '$lib/server/manage/types'

const BLOG_CONTENT_PREFIX = 'src/lib/content/blog/'
const MANAGED_UPLOAD_PREFIX = 'upload://'
const MAX_FILE_SIZE = 5 * 1024 * 1024
const MAX_TOTAL_UPLOAD_SIZE = 20 * 1024 * 1024
const SITE_ASSET_PATTERN = /\/images\/[^\s)"'`<>,]+/gu
const ALLOWED_MIME_TYPES = new Map<string, string>([
	['image/avif', 'avif'],
	['image/gif', 'gif'],
	['image/jpeg', 'jpg'],
	['image/png', 'png'],
	['image/webp', 'webp']
])

function normalizeSlug(value: string) {
	return value.trim()
}

function getCurrentTimestamp() {
	const now = new Date()
	const parts = [
		now.getUTCFullYear().toString(),
		(now.getUTCMonth() + 1).toString().padStart(2, '0'),
		now.getUTCDate().toString().padStart(2, '0'),
		now.getUTCHours().toString().padStart(2, '0'),
		now.getUTCMinutes().toString().padStart(2, '0'),
		now.getUTCSeconds().toString().padStart(2, '0')
	]

	return `${parts[0]}${parts[1]}${parts[2]}-${parts[3]}${parts[4]}${parts[5]}`
}

function sanitizeFileStem(name: string) {
	return (
		name
			.toLowerCase()
			.replace(/[^a-z0-9]+/gu, '-')
			.replace(/^-+|-+$/gu, '') || 'image'
	)
}

function getFileExtension(file: File) {
	const mimeExtension = ALLOWED_MIME_TYPES.get(file.type)

	if (!mimeExtension) {
		throw new ManageError(422, 'invalid_upload_type', `不支持的图片类型: ${file.type || 'unknown'}`)
	}

	if (/[/\\]/u.test(file.name)) {
		throw new ManageError(422, 'invalid_upload_name', `非法文件名: ${file.name}`)
	}

	const extension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : undefined

	if (extension === 'svg') {
		throw new ManageError(422, 'invalid_upload_type', '不允许上传 svg')
	}

	if (extension && extension !== mimeExtension) {
		return mimeExtension
	}

	return mimeExtension
}

function replacePlaceholder(input: string, placeholder: string, value: string) {
	return input.split(placeholder).join(value)
}

function normalizeFrontmatter(payload: ManageWritePayload) {
	return postFrontmatterSchema.parse({
		author: payload.author,
		canonical: payload.canonical,
		category: payload.category,
		cover: payload.cover,
		date: payload.date,
		description: payload.description,
		draft: payload.draft,
		featured: payload.featured,
		readingTime: payload.readingTime,
		series: payload.series,
		slug: normalizeSlug(payload.slug),
		tags: payload.tags,
		title: payload.title,
		toc: payload.toc,
		updated: payload.updated
	})
}

export function buildManagedPostPath(slug: string, format: ManagedPostFormat) {
	return `${BLOG_CONTENT_PREFIX}${slug}.${format}`
}

export function getManagedPostFormat(path: string): ManagedPostFormat {
	return path.endsWith('.svx') ? 'svx' : 'md'
}

export function repoPathFromSitePath(sitePath: string) {
	return `static${sitePath}`
}

export function extractAssetPaths(source: string, cover: string) {
	const bucket = new Set<string>()
	const matches = source.match(SITE_ASSET_PATTERN)

	for (const match of matches ?? []) {
		bucket.add(match)
	}

	bucket.add(cover)

	return Array.from(bucket.values()).sort()
}

export function parseRepositoryPost(file: RepoFileRecord): RepositoryManagedPost {
	const { body, frontmatter: rawFrontmatter } = parseContentFrontmatter<Record<string, unknown>>(
		file.content,
		file.path
	)
	const frontmatter = postFrontmatterSchema.parse(rawFrontmatter)

	return {
		assetPaths: extractAssetPaths(body, frontmatter.cover),
		format: getManagedPostFormat(file.path),
		frontmatter,
		path: file.path,
		sha: file.sha,
		slug: frontmatter.slug,
		source: body
	}
}

export async function validateMdsvexSource(source: string, filename: string) {
	if (!source.trim()) {
		throw new ManageError(422, 'invalid_source', 'source 不能为空')
	}

	try {
		await compile(source, {
			filename,
			remarkPlugins: [remarkGfm]
		})
	} catch (error) {
		const message = error instanceof Error ? error.message : 'mdsvex 语法校验失败'
		throw new ManageError(422, 'invalid_mdsvex', message)
	}
}

export function serializeManagedPost(payload: ManageWritePayload) {
	const frontmatter = normalizeFrontmatter(payload)
	const yaml = stringify(frontmatter).trimEnd()

	return `---\n${yaml}\n---\n\n${payload.source}`
}

export async function prepareUploadedAssets(files: File[], slug: string) {
	let totalSize = 0
	const seenPlaceholders = new Set<string>()
	const timestamp = getCurrentTimestamp()
	const assets: ManageUploadedAsset[] = []

	for (const [index, file] of files.entries()) {
		if (file.size > MAX_FILE_SIZE) {
			throw new ManageError(422, 'invalid_upload_size', `图片 ${file.name} 超过单文件大小限制 5 MB`)
		}

		totalSize += file.size

		if (totalSize > MAX_TOTAL_UPLOAD_SIZE) {
			throw new ManageError(422, 'invalid_upload_size', '上传总大小超过 20 MB')
		}

		const placeholder = `${MANAGED_UPLOAD_PREFIX}${file.name}`

		if (seenPlaceholders.has(placeholder)) {
			throw new ManageError(422, 'duplicate_upload_name', `重复上传文件名: ${file.name}`)
		}

		seenPlaceholders.add(placeholder)

		const extension = getFileExtension(file)
		const stem = sanitizeFileStem(file.name.replace(/\.[^.]+$/u, ''))
		const finalName = `${timestamp}-${index.toString().padStart(2, '0')}-${stem}.${extension}`
		const sitePath = `/images/posts/${slug}/${finalName}`
		const repoPath = repoPathFromSitePath(sitePath)

		assets.push({
			bytes: new Uint8Array(await file.arrayBuffer()),
			mimeType: file.type,
			originalName: file.name,
			placeholder,
			repoPath,
			sitePath
		})
	}

	return assets
}

export function applyUploadPlaceholders(
	payload: ManageWritePayload,
	assets: ManageUploadedAsset[]
) {
	let cover = payload.cover
	let source = payload.source

	for (const asset of assets) {
		cover = replacePlaceholder(cover, asset.placeholder, asset.sitePath)
		source = replacePlaceholder(source, asset.placeholder, asset.sitePath)
	}

	if (cover.includes(MANAGED_UPLOAD_PREFIX) || source.includes(MANAGED_UPLOAD_PREFIX)) {
		throw new ManageError(422, 'unresolved_upload_reference', '存在未解析的 upload:// 引用')
	}

	return {
		...payload,
		cover,
		source
	}
}

export function assertCoverPath(
	cover: string,
	repositoryPaths: Set<string>,
	newAssetPaths: Set<string>
) {
	if (!cover.startsWith('/') || cover.includes('..')) {
		throw new ManageError(422, 'invalid_cover_path', `cover 必须是站内绝对路径: ${cover}`)
	}

	if (newAssetPaths.has(cover)) {
		return
	}

	if (!repositoryPaths.has(repoPathFromSitePath(cover))) {
		throw new ManageError(422, 'missing_cover_path', `cover 指向的资源不存在: ${cover}`)
	}
}
