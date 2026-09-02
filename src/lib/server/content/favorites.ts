import type { FavoritesPageData } from '$lib/types/info-flow'
import { getFavoriteEntries } from './info-flow-records'

export function getFavoritesPageData(): FavoritesPageData {
	const favoriteEntries = getFavoriteEntries()
	const entries = [...favoriteEntries].sort((left, right) => right.added.localeCompare(left.added))
	const tagNames = new Map<string, string>()
	for (const entry of entries) {
		for (const tag of entry.tags) {
			const key = tag.trim().toLocaleLowerCase()
			if (key && !tagNames.has(key)) tagNames.set(key, tag.trim())
		}
	}

	return {
		entries,
		tags: Array.from(tagNames.values()).sort((left, right) => left.localeCompare(right)),
		totalEntries: entries.length
	}
}
