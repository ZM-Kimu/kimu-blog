import type { PostFrontmatter } from '$lib/content/schema'
import type {
	ManagePostWritePayload,
	ManagePostWriteResponse,
	ManagedPostFormat
} from '$lib/features/manage/contracts'

export type {
	ManageAccessActor,
	ManagePostListItem,
	ManageRepositoryInfo,
	ManageSessionResponse,
	ManagedPostFormat
} from '$lib/features/manage/contracts'

export interface ManageConfig {
	cfAccessAud: string
	cfAccessTeamDomain: string
	githubAppId: string
	githubAppInstallationId: string
	githubAppPrivateKey: string
	githubCommitterEmail: string
	githubCommitterName: string
	githubRepoBranch: string
	githubRepoName: string
	githubRepoOwner: string
}

export type ManageWritePayload = ManagePostWritePayload

export interface RepoFileRecord {
	content: string
	path: string
	sha: string
}

export interface RepositoryManagedPost {
	assetPaths: string[]
	format: ManagedPostFormat
	frontmatter: PostFrontmatter
	path: string
	sha: string
	slug: string
	source: string
}

export interface GitHubTreeEntry {
	mode: string
	path: string
	sha: string | null
	type: 'blob' | 'commit' | 'tree'
}

export interface ManageUploadedAsset {
	bytes: Uint8Array
	mimeType: string
	originalName: string
	placeholder: string
	repoPath: string
	sitePath: string
}

export type ManagePostResponse = ManagePostWriteResponse

export interface RepositorySnapshot {
	branchCommitSha: string
	branchTreeSha: string
	posts: RepositoryManagedPost[]
	treeEntries: Map<string, GitHubTreeEntry>
}
