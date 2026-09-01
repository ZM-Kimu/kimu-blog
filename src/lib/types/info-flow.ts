import type {
	FavoriteEntry,
	FavoriteKind,
	UpdateEntry,
	UpdateKind,
	UpdateStatus
} from '$lib/content/info-flow-schema'

export type { FavoriteEntry, FavoriteKind, UpdateEntry, UpdateKind, UpdateStatus }

export interface UpdateGroup {
	id: string
	label: string
	entries: UpdateEntry[]
}

export interface UpdatesPageData {
	entries: UpdateEntry[]
	groups: UpdateGroup[]
	filters: UpdateKind[]
	latestDate: string | null
	totalEntries: number
}

export interface FavoriteCollection {
	id: string
	title: string
	description: string
	entries: FavoriteEntry[]
}

export interface FavoritesPageData {
	entries: FavoriteEntry[]
	collections: FavoriteCollection[]
	totalEntries: number
}
