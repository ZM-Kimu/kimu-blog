import { favoriteEntrySchema, updateEntrySchema } from '$lib/content/info-flow-schema'
import type { FavoriteEntry, UpdateEntry } from '$lib/types/info-flow'

const updateModules = import.meta.glob('/src/lib/content/updates/*.json', {
	eager: true,
	import: 'default'
})
const favoriteModules = import.meta.glob('/src/lib/content/favorites/*.json', {
	eager: true,
	import: 'default'
})

function parseRecordModules<T extends { id: string }>(
	modules: Record<string, unknown>,
	parse: (value: unknown) => T,
	kind: string
) {
	const idBucket = new Set<string>()

	return Object.entries(modules).map(([path, value]) => {
		const record = parse(value)
		const { id } = record

		if (idBucket.has(id)) {
			throw new Error(`Duplicate ${kind} record id: ${id}`)
		}

		idBucket.add(id)

		if (!path.endsWith(`/${id}.json`)) {
			throw new Error(`${kind} record filename must match its id: ${path}`)
		}

		return record
	})
}

export function getUpdateEntries(): UpdateEntry[] {
	return parseRecordModules(updateModules, (value) => updateEntrySchema.parse(value), 'update')
}

export function getFavoriteEntries(): FavoriteEntry[] {
	return parseRecordModules(
		favoriteModules,
		(value) => favoriteEntrySchema.parse(value),
		'favorite'
	)
}
