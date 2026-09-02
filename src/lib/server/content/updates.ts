import type { UpdateGroup, UpdatesPageData } from '$lib/types/info-flow'
import { getUpdateEntries } from './info-flow-records'
import { getUpdateProjects } from './group-records'

function getGroupId(date: string) {
	return date.slice(0, 7)
}

function getGroupLabel(date: string) {
	return getGroupId(date).replace('-', '.')
}

export function getUpdatesPageData(): UpdatesPageData {
	const updateEntries = getUpdateEntries()
	const projects = new Map(getUpdateProjects().map((project) => [project.id, project]))
	const entries = updateEntries
		.map((entry) => ({
			...entry,
			projectName: entry.project ? projects.get(entry.project.id)?.name : undefined
		}))
		.sort((left, right) => right.date.localeCompare(left.date) || left.id.localeCompare(right.id))
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
		latestDate: entries[0]?.date ?? null,
		totalEntries: entries.length
	}
}
