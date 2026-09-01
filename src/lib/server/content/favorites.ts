import type { FavoriteCollection, FavoritesPageData } from '$lib/types/info-flow'
import { getFavoriteEntries } from './info-flow-records'

const collectionMeta: Record<string, { title: string; description: string }> = {
	engineering: {
		title: 'Engineering',
		description: '框架、部署、内容工作流与工程参考。'
	},
	interface: {
		title: 'Interface',
		description: '布局、视觉系统、动效和 game UI 参考。'
	},
	site: {
		title: 'Site Records',
		description: '站内值得回访的页面、文章和结构入口。'
	}
}

export function getFavoritesPageData(): FavoritesPageData {
	const favoriteEntries = getFavoriteEntries()
	const entries = [...favoriteEntries].sort((left, right) => right.added.localeCompare(left.added))
	const collectionMap = new Map<string, FavoriteCollection>()

	for (const entry of entries) {
		const meta = collectionMeta[entry.collection] ?? {
			title: entry.collection,
			description: 'Curated references.'
		}
		const existing = collectionMap.get(entry.collection)

		if (existing) {
			existing.entries.push(entry)
			continue
		}

		collectionMap.set(entry.collection, {
			id: entry.collection,
			title: meta.title,
			description: meta.description,
			entries: [entry]
		})
	}

	return {
		entries,
		collections: Array.from(collectionMap.values()),
		totalEntries: entries.length
	}
}
