import type { PostFrontmatter } from '$lib/content/schema';

export type ManagedPostFormat = 'md' | 'svx';

export interface ManageAccessActor {
	sub: string;
	email: string | null;
	name: string | null;
	issuer: string;
	audience: string[];
}

export interface ManageConfig {
	cfAccessAud: string;
	cfAccessTeamDomain: string;
	githubAppId: string;
	githubAppInstallationId: string;
	githubAppPrivateKey: string;
	githubCommitterEmail: string;
	githubCommitterName: string;
	githubRepoBranch: string;
	githubRepoName: string;
	githubRepoOwner: string;
}

export interface ManageWritePayload extends PostFrontmatter {
	source: string;
	format?: ManagedPostFormat;
	expectedSha?: string;
}

export interface RepoFileRecord {
	content: string;
	path: string;
	sha: string;
}

export interface RepositoryManagedPost {
	assetPaths: string[];
	format: ManagedPostFormat;
	frontmatter: PostFrontmatter;
	path: string;
	sha: string;
	slug: string;
	source: string;
}

export interface GitHubTreeEntry {
	mode: string;
	path: string;
	sha: string | null;
	type: 'blob' | 'commit' | 'tree';
}

export interface ManageUploadedAsset {
	bytes: Uint8Array;
	mimeType: string;
	originalName: string;
	placeholder: string;
	repoPath: string;
	sitePath: string;
}

export interface ManagePostResponse {
	assetPaths: string[];
	commitSha: string;
	format: ManagedPostFormat;
	path: string;
	sha: string;
	slug: string;
}

export interface RepositorySnapshot {
	branchCommitSha: string;
	branchTreeSha: string;
	posts: RepositoryManagedPost[];
	treeEntries: Map<string, GitHubTreeEntry>;
}
