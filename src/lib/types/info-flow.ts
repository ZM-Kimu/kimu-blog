export type UpdateKind = 'site' | 'writing' | 'design' | 'work'
export type UpdateStatus = 'live' | 'shipped' | 'tracking' | 'queued'

export interface UpdateEntry {
	id: string
	date: string
	kind: UpdateKind
	status: UpdateStatus
	title: string
	summary: string
	tags: string[]
	href?: string
}

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

export type FavoriteKind = 'article' | 'tool' | 'reference' | 'site'
export type FavoriteHref = `http://${string}` | `https://${string}` | `/${string}`

export interface FavoriteEntry {
	id: string
	title: string
	description: string
	href: FavoriteHref
	kind: FavoriteKind
	sourceLabel: string
	collection: string
	added: string
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
