import type { PostFrontmatter } from '$lib/content/schema'
import type { BlogCategory } from '$lib/content/blog-categories'
import type { BlogSeries, ManageGroupKind, UpdateProject } from '$lib/content/group-schema'
import type { FavoriteEntry, UpdateEntry } from '$lib/types/info-flow'

export type ManagedPostFormat = 'md' | 'svx'

export interface ManageAccessActor {
	audience: string[]
	email: string | null
	issuer: string
	name: string | null
	sub: string
}

export interface ManageRepositoryInfo {
	branch: string
	commitSha?: string
	name: string
	owner: string
}

export interface ManageSessionResponse {
	actor: ManageAccessActor
	csrfToken: string
	repository: ManageRepositoryInfo
}

export type ManagePostFrontmatter = PostFrontmatter

export interface ManagePostDocument {
	assetPaths: string[]
	format: ManagedPostFormat
	frontmatter: ManagePostFrontmatter
	path: string
	sha: string
	slug: string
	source: string
}

export interface ManagePostListItem {
	category: BlogCategory
	date: string
	description: string
	draft: boolean
	featured: boolean
	format: ManagedPostFormat
	sha: string
	slug: string
	title: string
	updated: string
}

export interface ManagePostListResponse {
	items: ManagePostListItem[]
}

export interface ManagePostWriteResponse {
	assetPaths: string[]
	commitSha: string
	format: ManagedPostFormat
	path: string
	sha: string
	slug: string
}

export interface ManagePostWritePayload extends ManagePostFrontmatter {
	expectedSha?: string
	format?: ManagedPostFormat
	seriesName?: string
	source: string
}

export type ManageRecordKind = 'updates' | 'favorites'

export interface ManageRecordDocument<TEntry> {
	entry: TEntry
	path: string
	sha: string
}

export type ManageUpdateDocument = ManageRecordDocument<UpdateEntry>
export type ManageFavoriteDocument = ManageRecordDocument<FavoriteEntry>

export interface ManageRecordListResponse<TEntry> {
	items: ManageRecordDocument<TEntry>[]
}

export type ManageUpdateListResponse = ManageRecordListResponse<UpdateEntry>
export type ManageFavoriteListResponse = ManageRecordListResponse<FavoriteEntry>

export type ManageUpdateWritePayload = UpdateEntry & {
	expectedSha?: string
	projectName?: string
}
export type ManageFavoriteWritePayload = FavoriteEntry & { expectedSha?: string }

export type ManageGroup = UpdateProject | BlogSeries
export type { ManageGroupKind }

export interface ManageGroupListResponse {
	items: ManageGroupDocument[]
}

export interface ManageGroupRenamePayload {
	expectedSha: string
	name: string
}

export interface ManageGroupDocument<TGroup extends ManageGroup = ManageGroup> {
	group: TGroup
	path: string
	sha: string
}

export interface ManageRecordWriteResponse {
	commitSha: string
	id: string
	path: string
	sha: string
}
