import { z } from 'zod'

export const groupIdSchema = z
	.string()
	.trim()
	.min(1)
	.max(96)
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, 'group id must use lowercase letters, numbers, and hyphens')

export const groupNameSchema = z.string().trim().min(1).max(96)

export const updateProjectSchema = z.object({
	id: groupIdSchema,
	name: groupNameSchema,
	currentProgress: z.number().int().min(0).max(100)
})

export const blogSeriesSchema = z.object({
	id: groupIdSchema,
	name: groupNameSchema
})

export type UpdateProject = z.infer<typeof updateProjectSchema>
export type BlogSeries = z.infer<typeof blogSeriesSchema>
export type ManageGroupKind = 'projects' | 'series'

export function normalizeGroupName(value: string) {
	return value.trim().replace(/\s+/gu, ' ')
}

export function createStableGroupId(value: string) {
	const source = normalizeGroupName(value)
	const normalized = source
		.normalize('NFKD')
		.toLowerCase()
		.replace(/[’']/gu, '')
		.replace(/[^a-z0-9]+/gu, '-')
		.replace(/^-+|-+$/gu, '')
		.slice(0, 80)
		.replace(/-+$/gu, '')

	if (normalized || !source) return normalized

	let hash = 2166136261
	for (const character of source) {
		hash ^= character.codePointAt(0) ?? 0
		hash = Math.imul(hash, 16777619)
	}

	return `group-${(hash >>> 0).toString(36)}`
}

export function resolveProjectCurrentProgress(
	entries: ReadonlyArray<{
		id: string
		date: string
		project?: { id: string; progress: number }
	}>,
	projectId: string
) {
	return [...entries]
		.filter((entry) => entry.project?.id === projectId)
		.sort(
			(left, right) => right.date.localeCompare(left.date) || left.id.localeCompare(right.id)
		)[0]?.project?.progress
}
