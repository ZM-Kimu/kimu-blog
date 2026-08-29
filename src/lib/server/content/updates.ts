import { updateEntries } from '$lib/content/updates'
import type { UpdateGroup, UpdatesPageData } from '$lib/types/info-flow'

function getGroupId(date: string) {
	return date.slice(0, 7)
}

function getGroupLabel(date: string) {
	return getGroupId(date).replace('-', '.')
}

export function getUpdatesPageData(): UpdatesPageData {
	const entries = [...updateEntries].sort((left, right) => right.date.localeCompare(left.date))
	const groupMap = new Map<string, UpdateGroup>()

	for (const entry of entries) {
		const id = getGroupId(entry.date)
		const existing = groupMap.get(id)

		if (existing) {
			existing.entries.push(entry)
			continue
		}

		groupMap.set(id, {
			id,
			label: getGroupLabel(entry.date),
			entries: [entry]
		})
	}

	return {
		entries,
		groups: Array.from(groupMap.values()),
		filters: Array.from(new Set(entries.map((entry) => entry.kind))),
		latestDate: entries[0]?.date ?? null,
		totalEntries: entries.length
	}
}
