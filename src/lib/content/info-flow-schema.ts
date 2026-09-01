import { z } from 'zod'

const datePattern = /^\d{4}-\d{2}-\d{2}$/u
const recordIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u
const internalHrefPattern = /^\/(?!\/)/u

const recordIdSchema = z
	.string()
	.trim()
	.min(1)
	.max(96)
	.regex(recordIdPattern, 'id must use lowercase letters, numbers, and hyphens')
const dateSchema = z.string().regex(datePattern, 'date must use YYYY-MM-DD')
const contentHrefSchema = z
	.string()
	.trim()
	.refine(
		(value) => internalHrefPattern.test(value) || /^https?:\/\//u.test(value),
		'href must be an internal path or an HTTP(S) URL'
	)

export const updateKindSchema = z.enum(['site', 'writing', 'design', 'work'])
export const updateStatusSchema = z.enum(['live', 'shipped', 'tracking', 'queued'])
export const favoriteKindSchema = z.enum(['article', 'tool', 'reference', 'site'])

export const updateEntrySchema = z.object({
	id: recordIdSchema,
	date: dateSchema,
	kind: updateKindSchema,
	status: updateStatusSchema,
	title: z.string().trim().min(1).max(160),
	summary: z.string().trim().min(1).max(800),
	tags: z.array(z.string().trim().min(1).max(48)).max(16).default([]),
	href: contentHrefSchema.optional()
})

export const favoriteEntrySchema = z.object({
	id: recordIdSchema,
	title: z.string().trim().min(1).max(160),
	description: z.string().trim().min(1).max(800),
	href: contentHrefSchema,
	kind: favoriteKindSchema,
	sourceLabel: z.string().trim().min(1).max(96),
	collection: recordIdSchema,
	added: dateSchema
})

export type UpdateKind = z.infer<typeof updateKindSchema>
export type UpdateStatus = z.infer<typeof updateStatusSchema>
export type UpdateEntry = z.infer<typeof updateEntrySchema>
export type FavoriteKind = z.infer<typeof favoriteKindSchema>
export type FavoriteEntry = z.infer<typeof favoriteEntrySchema>
