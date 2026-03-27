import {
	applyUploadPlaceholders,
	assertCoverPath,
	buildManagedPostPath,
	extractAssetPaths,
	prepareUploadedAssets,
	serializeManagedPost,
	validateManageSource
} from '$lib/server/manage/content'
import { getManageConfig } from '$lib/server/manage/config'
import { ManageError } from '$lib/server/manage/errors'
import type { GitHubRepositoryClient } from '$lib/server/manage/github'
import {
	assertManagedSlugAvailable,
	findManagedRepositoryPost,
	loadManageRepositoryContext
} from '$lib/server/manage/repository'
import type {
	ManageAccessActor,
	ManagePostListItem,
	ManagePostResponse,
	ManageSessionResponse,
	ManageWritePayload,
	RepositoryManagedPost,
	RepositorySnapshot
} from '$lib/server/manage/types'

interface PreparedManagedWrite {
	assetBlobEntries: Array<{ path: string; sha: string }>
	assetPaths: string[]
	postBlobSha: string
	rewrittenPayload: ManageWritePayload
}

function buildCommitMessage(
	action: 'create' | 'delete' | 'update',
	slug: string,
	actor: ManageAccessActor
) {
	const actorIdentity = actor.email ?? actor.name ?? actor.sub

	return `docs(blog): ${action} ${slug}\n\nactor: ${actorIdentity}\nsubject: ${actor.sub}`
}

function toManagePostResponse(
	post: Pick<RepositoryManagedPost, 'assetPaths' | 'format' | 'path' | 'sha' | 'slug'>,
	commitSha: string
): ManagePostResponse {
	return {
		assetPaths: post.assetPaths,
		commitSha,
		format: post.format,
		path: post.path,
		sha: post.sha,
		slug: post.slug
	}
}

function toRepositoryInfo(platform: App.Platform | undefined, commitSha?: string) {
	const config = getManageConfig(platform)

	return {
		branch: config.githubRepoBranch,
		commitSha,
		name: config.githubRepoName,
		owner: config.githubRepoOwner
	}
}

function compareManagedPosts(a: RepositoryManagedPost, b: RepositoryManagedPost) {
	return (
		b.frontmatter.updated.localeCompare(a.frontmatter.updated) ||
		b.frontmatter.date.localeCompare(a.frontmatter.date) ||
		a.slug.localeCompare(b.slug)
	)
}

async function prepareManagedWrite(
	client: GitHubRepositoryClient,
	snapshot: RepositorySnapshot,
	payload: ManageWritePayload,
	files: File[]
): Promise<PreparedManagedWrite> {
	const uploadedAssets = await prepareUploadedAssets(files, payload.slug)
	const rewrittenPayload = applyUploadPlaceholders(payload, uploadedAssets)
	const repositoryPaths = new Set(snapshot.treeEntries.keys())
	const newAssetPaths = new Set(uploadedAssets.map((asset) => asset.sitePath))

	assertCoverPath(rewrittenPayload.cover, repositoryPaths, newAssetPaths)
	await validateManageSource(rewrittenPayload.source)

	const postBlobSha = await client.createTextBlob(serializeManagedPost(rewrittenPayload))
	const assetBlobEntries = await Promise.all(
		uploadedAssets.map(async (asset) => ({
			path: asset.repoPath,
			sha: await client.createBinaryBlob(asset.bytes)
		}))
	)

	return {
		assetBlobEntries,
		assetPaths: extractAssetPaths(rewrittenPayload.source, rewrittenPayload.cover),
		postBlobSha,
		rewrittenPayload
	}
}

export async function getManageHealth(
	platform: App.Platform | undefined,
	actor: ManageAccessActor
) {
	const { snapshot } = await loadManageRepositoryContext(platform)

	return {
		actor,
		ok: true,
		repository: toRepositoryInfo(platform, snapshot.branchCommitSha)
	}
}

export function getManageSession(
	platform: App.Platform | undefined,
	actor: ManageAccessActor,
	csrfToken: string
): ManageSessionResponse {
	return {
		actor,
		csrfToken,
		repository: toRepositoryInfo(platform)
	}
}

export async function listManagedPosts(
	platform: App.Platform | undefined
): Promise<{ items: ManagePostListItem[] }> {
	const { snapshot } = await loadManageRepositoryContext(platform)

	return {
		items: snapshot.posts.sort(compareManagedPosts).map((post) => ({
			category: post.frontmatter.category,
			date: post.frontmatter.date,
			description: post.frontmatter.description,
			draft: post.frontmatter.draft,
			featured: post.frontmatter.featured,
			format: post.format,
			sha: post.sha,
			slug: post.slug,
			title: post.frontmatter.title,
			updated: post.frontmatter.updated
		}))
	}
}

export async function getManagedPost(platform: App.Platform | undefined, slug: string) {
	const { snapshot } = await loadManageRepositoryContext(platform)
	const post = findManagedRepositoryPost(snapshot.posts, slug)

	if (!post) {
		throw new ManageError(404, 'post_not_found', `文章不存在: ${slug}`)
	}

	return {
		assetPaths: post.assetPaths,
		format: post.format,
		frontmatter: post.frontmatter,
		path: post.path,
		sha: post.sha,
		slug: post.slug,
		source: post.source
	}
}

export async function createManagedPost(
	platform: App.Platform | undefined,
	actor: ManageAccessActor,
	payload: ManageWritePayload,
	files: File[]
) {
	const { client, snapshot } = await loadManageRepositoryContext(platform)
	assertManagedSlugAvailable(snapshot.posts, payload.slug)

	const format = payload.format ?? 'svx'
	const targetPath = buildManagedPostPath(payload.slug, format)

	if (snapshot.treeEntries.has(targetPath)) {
		throw new ManageError(409, 'path_conflict', `目标路径已存在: ${targetPath}`)
	}

	const prepared = await prepareManagedWrite(client, snapshot, payload, files)
	const treeSha = await client.createTree(snapshot.branchTreeSha, [
		{
			path: targetPath,
			sha: prepared.postBlobSha
		},
		...prepared.assetBlobEntries
	])
	const commitSha = await client.createCommit(
		buildCommitMessage('create', prepared.rewrittenPayload.slug, actor),
		treeSha,
		snapshot.branchCommitSha
	)
	await client.updateBranchRef(commitSha)

	return toManagePostResponse(
		{
			assetPaths: prepared.assetPaths,
			format,
			path: targetPath,
			sha: prepared.postBlobSha,
			slug: prepared.rewrittenPayload.slug
		},
		commitSha
	)
}

export async function updateManagedPost(
	platform: App.Platform | undefined,
	actor: ManageAccessActor,
	currentSlug: string,
	payload: ManageWritePayload,
	files: File[]
) {
	const { client, snapshot } = await loadManageRepositoryContext(platform)
	const existing = findManagedRepositoryPost(snapshot.posts, currentSlug)

	if (!existing) {
		throw new ManageError(404, 'post_not_found', `文章不存在: ${currentSlug}`)
	}

	if (payload.expectedSha !== existing.sha) {
		throw new ManageError(409, 'sha_conflict', 'expectedSha 与当前文件不一致')
	}

	assertManagedSlugAvailable(snapshot.posts, payload.slug, existing.path)

	const format = payload.format ?? existing.format
	const nextPath = buildManagedPostPath(payload.slug, format)

	if (nextPath !== existing.path && snapshot.treeEntries.has(nextPath)) {
		throw new ManageError(409, 'path_conflict', `目标路径已存在: ${nextPath}`)
	}

	const prepared = await prepareManagedWrite(client, snapshot, payload, files)
	const treeChanges: Array<{ path: string; sha: string | null }> = [
		{
			path: nextPath,
			sha: prepared.postBlobSha
		},
		...prepared.assetBlobEntries
	]

	if (nextPath !== existing.path) {
		treeChanges.push({
			path: existing.path,
			sha: null
		})
	}

	const treeSha = await client.createTree(snapshot.branchTreeSha, treeChanges)
	const commitSha = await client.createCommit(
		buildCommitMessage('update', prepared.rewrittenPayload.slug, actor),
		treeSha,
		snapshot.branchCommitSha
	)
	await client.updateBranchRef(commitSha)

	return toManagePostResponse(
		{
			assetPaths: prepared.assetPaths,
			format,
			path: nextPath,
			sha: prepared.postBlobSha,
			slug: prepared.rewrittenPayload.slug
		},
		commitSha
	)
}

export async function deleteManagedPost(
	platform: App.Platform | undefined,
	actor: ManageAccessActor,
	slug: string,
	expectedSha: string
) {
	const { client, snapshot } = await loadManageRepositoryContext(platform)
	const existing = findManagedRepositoryPost(snapshot.posts, slug)

	if (!existing) {
		throw new ManageError(404, 'post_not_found', `文章不存在: ${slug}`)
	}

	if (expectedSha !== existing.sha) {
		throw new ManageError(409, 'sha_conflict', 'expectedSha 与当前文件不一致')
	}

	const treeSha = await client.createTree(snapshot.branchTreeSha, [
		{
			path: existing.path,
			sha: null
		}
	])
	const commitSha = await client.createCommit(
		buildCommitMessage('delete', existing.slug, actor),
		treeSha,
		snapshot.branchCommitSha
	)
	await client.updateBranchRef(commitSha)

	return toManagePostResponse(existing, commitSha)
}
