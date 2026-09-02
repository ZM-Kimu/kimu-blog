export type {
	ManageAccessActor,
	ManageFavoriteDocument,
	ManageFavoriteListResponse,
	ManageFavoriteWritePayload,
	ManageGroup,
	ManageGroupDocument,
	ManageGroupKind,
	ManageGroupListResponse,
	ManageGroupRenamePayload,
	ManagePostDocument,
	ManagePostFrontmatter,
	ManagePostListItem,
	ManagePostListResponse,
	ManagePostWritePayload,
	ManagePostWriteResponse,
	ManageRepositoryInfo,
	ManageRecordDocument,
	ManageRecordKind,
	ManageRecordListResponse,
	ManageRecordWriteResponse,
	ManageSessionResponse,
	ManageUpdateDocument,
	ManageUpdateListResponse,
	ManageUpdateWritePayload,
	ManagedPostFormat
} from './contracts'

import type { ManagedPostFormat } from './contracts'

export interface ManagePostFormState {
	author: string
	category: string
	cover: string
	date: string
	description: string
	draft: boolean
	expectedSha?: string
	featured: boolean
	format: ManagedPostFormat
	readingTime: string
	seriesId: string
	seriesName: string
	slug: string
	source: string
	tagsInput: string
	title: string
	toc: boolean
	updated: string
}

export interface ManageApiErrorPayload {
	error?: {
		code?: string
		details?: unknown
		message?: string
	}
}
