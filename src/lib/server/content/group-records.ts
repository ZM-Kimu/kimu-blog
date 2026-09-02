import {
	blogSeriesSchema,
	updateProjectSchema,
	type BlogSeries,
	type UpdateProject
} from '$lib/content/group-schema'

const projectModules = import.meta.glob('/src/lib/content/update-projects/*.json', {
	eager: true,
	import: 'default'
})
const seriesModules = import.meta.glob('/src/lib/content/blog-series/*.json', {
	eager: true,
	import: 'default'
})

function parseGroups<T extends { id: string }>(
	modules: Record<string, unknown>,
	parse: (value: unknown) => T,
	kind: string
) {
	const ids = new Set<string>()
	return Object.entries(modules).map(([path, value]) => {
		const group = parse(value)
		if (ids.has(group.id)) throw new Error(`Duplicate ${kind} id: ${group.id}`)
		if (!path.endsWith(`/${group.id}.json`)) {
			throw new Error(`${kind} filename must match its id: ${path}`)
		}
		ids.add(group.id)
		return group
	})
}

export function getUpdateProjects(): UpdateProject[] {
	return parseGroups(projectModules, (value) => updateProjectSchema.parse(value), 'update project')
}

export function getBlogSeries(): BlogSeries[] {
	return parseGroups(seriesModules, (value) => blogSeriesSchema.parse(value), 'blog series')
}
