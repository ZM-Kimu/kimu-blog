export type {
	ManageAccessActor,
	ManagePostDocument,
	ManagePostFrontmatter,
	ManagePostListItem,
	ManagePostListResponse,
	ManagePostWritePayload,
	ManagePostWriteResponse,
	ManageRepositoryInfo,
	ManageSessionResponse,
	ManagedPostFormat
} from './contracts'

import type { ManagedPostFormat } from './contracts'

export interface ManagePostFormState {
	author: string
	canonical: string
	category: string
	cover: string
	date: string
	description: string
	draft: boolean
	expectedSha?: string
	featured: boolean
	format: ManagedPostFormat
	readingTime: string
	series: string
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
