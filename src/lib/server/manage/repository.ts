import { getManageConfig } from '$lib/server/manage/config';
import { parseRepositoryPost } from '$lib/server/manage/content';
import { ManageError } from '$lib/server/manage/errors';
import { createGitHubRepositoryClient } from '$lib/server/manage/github';
import type { RepositoryManagedPost, RepositorySnapshot } from '$lib/server/manage/types';

const BLOG_FILE_PATTERN = /^src\/lib\/content\/blog\/[^/]+\.(md|svx)$/u;

export interface ManageRepositoryContext {
	client: Awaited<ReturnType<typeof createGitHubRepositoryClient>>;
	config: ReturnType<typeof getManageConfig>;
	snapshot: RepositorySnapshot;
}

export async function loadManageRepositoryContext(
	platform: App.Platform | undefined
): Promise<ManageRepositoryContext> {
	const config = getManageConfig(platform);
	const client = await createGitHubRepositoryClient(config);
	const branchState = await client.getBranchState();
	const tree = await client.getRecursiveTree(branchState.treeSha);
	const treeEntries = new Map(tree.map((entry) => [entry.path, entry]));
	const blogFiles = tree.filter(
		(entry) =>
			entry.type === 'blob' && typeof entry.sha === 'string' && BLOG_FILE_PATTERN.test(entry.path)
	);
	const repoFiles = await Promise.all(
		blogFiles.map(async (entry) => ({
			content: await client.getBlobText(entry.sha as string),
			path: entry.path,
			sha: entry.sha as string
		}))
	);
	const posts = repoFiles.map(parseRepositoryPost);
	const slugBucket = new Set<string>();

	for (const post of posts) {
		if (slugBucket.has(post.slug)) {
			throw new ManageError(409, 'duplicate_slug', `仓库存在重复 slug: ${post.slug}`);
		}

		slugBucket.add(post.slug);
	}

	return {
		client,
		config,
		snapshot: {
			branchCommitSha: branchState.commitSha,
			branchTreeSha: branchState.treeSha,
			posts,
			treeEntries
		}
	};
}

export function findManagedRepositoryPost(posts: RepositoryManagedPost[], slug: string) {
	return posts.find((post) => post.slug === slug) ?? null;
}

export function assertManagedSlugAvailable(
	posts: RepositoryManagedPost[],
	slug: string,
	currentPath?: string
) {
	const conflicting = posts.find((post) => post.slug === slug && post.path !== currentPath);

	if (conflicting) {
		throw new ManageError(409, 'duplicate_slug', `slug 已存在: ${slug}`);
	}
}
