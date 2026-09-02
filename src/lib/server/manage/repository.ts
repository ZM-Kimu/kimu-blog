import { getManageConfig } from '$lib/server/manage/config'
import { parseRepositoryPost } from '$lib/server/manage/content'
import { ManageError } from '$lib/server/manage/errors'
import { createGitHubRepositoryClient } from '$lib/server/manage/github'
import type {
	RepoFileRecord,
	RepositoryBaseSnapshot,
	RepositoryManagedPost,
	RepositorySnapshot
} from '$lib/server/manage/types'

const BLOG_FILE_PATTERN = /^src\/lib\/content\/blog\/[^/]+\.(md|svx)$/u

export interface ManageRepositoryContext {
	client: Awaited<ReturnType<typeof createGitHubRepositoryClient>>
	config: ReturnType<typeof getManageConfig>
	snapshot: RepositorySnapshot
}

export interface ManageRepositoryBaseContext {
	client: Awaited<ReturnType<typeof createGitHubRepositoryClient>>
	config: ReturnType<typeof getManageConfig>
	snapshot: RepositoryBaseSnapshot
}

export async function loadManageRepositoryBaseContext(
	platform: App.Platform | undefined
): Promise<ManageRepositoryBaseContext> {
	const config = getManageConfig(platform)
	const client = await createGitHubRepositoryClient(config)
	const branchState = await client.getBranchState()
	const tree = await client.getRecursiveTree(branchState.treeSha)

	return {
		client,
		config,
		snapshot: {
			branchCommitSha: branchState.commitSha,
			branchTreeSha: branchState.treeSha,
			treeEntries: new Map(tree.map((entry) => [entry.path, entry]))
		}
	}
}

export async function loadRepositoryTextFiles(
	context: ManageRepositoryBaseContext,
	matchesPath: (path: string) => boolean
): Promise<RepoFileRecord[]> {
	const entries = Array.from(context.snapshot.treeEntries.values()).filter(
		(entry) => entry.type === 'blob' && typeof entry.sha === 'string' && matchesPath(entry.path)
	)

	return Promise.all(
		entries.map(async (entry) => ({
			content: await context.client.getBlobText(entry.sha as string),
			path: entry.path,
			sha: entry.sha as string
		}))
	)
}

export async function loadManageRepositoryContext(
	platform: App.Platform | undefined
): Promise<ManageRepositoryContext> {
	const context = await loadManageRepositoryBaseContext(platform)
	const repoFiles = await loadRepositoryTextFiles(context, (path) => BLOG_FILE_PATTERN.test(path))
	const posts = repoFiles.map(parseRepositoryPost)
	const slugBucket = new Set<string>()

	for (const post of posts) {
		if (slugBucket.has(post.slug)) {
			throw new ManageError(409, 'duplicate_slug', `仓库存在重复 slug: ${post.slug}`)
		}

		slugBucket.add(post.slug)
	}

	return {
		client: context.client,
		config: context.config,
		snapshot: {
			branchCommitSha: context.snapshot.branchCommitSha,
			branchTreeSha: context.snapshot.branchTreeSha,
			posts,
			treeEntries: context.snapshot.treeEntries
		}
	}
}

export function findManagedRepositoryPost(posts: RepositoryManagedPost[], slug: string) {
	return posts.find((post) => post.slug === slug) ?? null
}

export function assertManagedSlugAvailable(
	posts: RepositoryManagedPost[],
	slug: string,
	currentPath?: string
) {
	const conflicting = posts.find((post) => post.slug === slug && post.path !== currentPath)

	if (conflicting) {
		throw new ManageError(409, 'duplicate_slug', `slug 已存在: ${slug}`)
	}
}
