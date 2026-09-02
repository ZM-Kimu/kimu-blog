import type { PostFrontmatter } from '$lib/content/schema'
import type { BlogSeries } from '$lib/content/group-schema'

export interface BlogPost extends PostFrontmatter {
	path: string
	permalink: `/blog/${string}`
	tagSlugs: string[]
	categorySlug: string | null
}

export interface BlogSeriesNavigation {
	series: BlogSeries
	newer: BlogPost | null
	older: BlogPost | null
}

export interface TagSummary {
	name: string
	slug: string
	count: number
}

export interface CategorySummary {
	name: string
	slug: string
	count: number
}

export interface TagResult {
	tag: TagSummary
	posts: BlogPost[]
}
