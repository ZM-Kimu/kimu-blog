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

export const updateEntrySchema = z.object({
	id: recordIdSchema,
	date: dateSchema,
	title: z.string().trim().min(1).max(160),
	summary: z.string().trim().min(1).max(800),
	tags: z.array(z.string().trim().min(1).max(48)).max(16).default([]),
	href: contentHrefSchema.optional(),
	project: z
		.object({
			id: recordIdSchema,
			progress: z.number().int().min(0).max(100)
		})
		.optional()
})

export const favoriteEntrySchema = z.object({
	id: recordIdSchema,
	title: z.string().trim().min(1).max(160),
	description: z.string().trim().min(1).max(800),
	href: contentHrefSchema,
	sourceLabel: z.string().trim().min(1).max(96),
	tags: z.array(z.string().trim().min(1).max(48)).max(24).default([]),
	added: dateSchema
})

export type UpdateEntry = z.infer<typeof updateEntrySchema>
export type FavoriteEntry = z.infer<typeof favoriteEntrySchema>
