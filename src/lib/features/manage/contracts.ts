import type { PostFrontmatter } from '$lib/content/schema'
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
	category?: string
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

export type ManageUpdateWritePayload = UpdateEntry & { expectedSha?: string }
export type ManageFavoriteWritePayload = FavoriteEntry & { expectedSha?: string }

export interface ManageRecordWriteResponse {
	commitSha: string
	id: string
	path: string
	sha: string
}
