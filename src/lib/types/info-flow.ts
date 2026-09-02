import type { FavoriteEntry, UpdateEntry } from '$lib/content/info-flow-schema'

export type { FavoriteEntry, UpdateEntry }

export interface PublicUpdateEntry extends UpdateEntry {
	projectName?: string
}

export interface UpdateGroup {
	id: string
	label: string
	entries: PublicUpdateEntry[]
}

export interface UpdatesPageData {
	entries: PublicUpdateEntry[]
	groups: UpdateGroup[]
	latestDate: string | null
	totalEntries: number
}

export interface FavoritesPageData {
	entries: FavoriteEntry[]
	tags: string[]
	totalEntries: number
}
