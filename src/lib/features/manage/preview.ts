import DOMPurify from 'dompurify'
import { marked } from 'marked'

const CODE_FENCE_PATTERN = /(```[\s\S]*?```|~~~[\s\S]*?~~~)/gu
const IMPORT_LINE_PATTERN = /^\s*import\s+.+$/gmu
const SCRIPT_BLOCK_PATTERN = /<script\b[^>]*>[\s\S]*?<\/script>/giu
const STYLE_BLOCK_PATTERN = /<style\b[^>]*>[\s\S]*?<\/style>/giu
const COMPONENT_BLOCK_PATTERN = /<([A-Z][\w.]*(?::[\w-]+)?|svelte:[\w-]+)\b[^>]*>[\s\S]*?<\/\1>/gu
const COMPONENT_SELF_CLOSING_PATTERN = /<([A-Z][\w.]*(?::[\w-]+)?|svelte:[\w-]+)\b[^>]*\/>/gu
const BLOB_SAFE_URI_PATTERN =
	/^(?:(?:https?|mailto|tel|blob):|\/(?!\/)|#|\.{1,2}\/|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/iu

function buildPlaceholder(kind: 'component' | 'import' | 'script' | 'style', label: string) {
	return `
<div class="manage-preview__placeholder" data-preview-kind="${kind}">
	<strong>${label}</strong>
	<p>预览面板不会执行这段 mdsvex / Svelte 逻辑。</p>
</div>
`
}

function replaceOutsideCodeFences(source: string, transform: (segment: string) => string) {
	return source
		.split(CODE_FENCE_PATTERN)
		.map((segment, index) => (index % 2 === 1 ? segment : transform(segment)))
		.join('')
}

function replaceManageUploadPlaceholders(source: string, uploads: Map<string, string>) {
	let output = source

	for (const [placeholder, url] of uploads) {
		output = output.split(placeholder).join(url)
	}

	return output
}

function normalizeMdsvexForPreview(source: string) {
	return replaceOutsideCodeFences(source, (segment) =>
		segment
			.replace(IMPORT_LINE_PATTERN, (value) => buildPlaceholder('import', value.trim()))
			.replace(SCRIPT_BLOCK_PATTERN, () => buildPlaceholder('script', '<script> block'))
			.replace(STYLE_BLOCK_PATTERN, () => buildPlaceholder('style', '<style> block'))
			.replace(COMPONENT_BLOCK_PATTERN, (_value, name: string) =>
				buildPlaceholder('component', `${name} component`)
			)
			.replace(COMPONENT_SELF_CLOSING_PATTERN, (_value, name: string) =>
				buildPlaceholder('component', `${name} component`)
			)
	)
}

export function resolvePreviewAssetPath(path: string, uploads: Map<string, string>) {
	if (!path) {
		return ''
	}

	return replaceManageUploadPlaceholders(path, uploads)
}

export function renderManagePreviewHtml(source: string, uploads: Map<string, string>) {
	const normalized = normalizeMdsvexForPreview(replaceManageUploadPlaceholders(source, uploads))
	const html = marked.parse(normalized, {
		gfm: true
	}) as string

	return DOMPurify.sanitize(html, {
		ALLOWED_URI_REGEXP: BLOB_SAFE_URI_PATTERN,
		USE_PROFILES: { html: true }
	})
}
