import { z } from 'zod'

const datePattern = /^\d{4}-\d{2}-\d{2}$/
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const postFrontmatterSchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	date: z.string().regex(datePattern, 'date 必须使用 YYYY-MM-DD 格式'),
	updated: z.string().regex(datePattern, 'updated 必须使用 YYYY-MM-DD 格式'),
	tags: z.array(z.string().min(1)).default([]),
	category: z.string().min(1).optional(),
	draft: z.boolean().default(false),
	cover: z.string().min(1),
	slug: z.string().regex(slugPattern, 'slug 只允许小写字母、数字和中划线'),
	featured: z.boolean().default(false),
	author: z.string().min(1).optional(),
	series: z.string().min(1).optional(),
	toc: z.boolean().default(true),
	readingTime: z.string().min(1).optional(),
	canonical: z.url().optional()
})

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>
