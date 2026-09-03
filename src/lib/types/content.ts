import type { PostFrontmatter } from '$lib/content/schema'
import type { BlogCategory } from '$lib/content/blog-categories'
import type { BlogSeries } from '$lib/content/group-schema'

export interface BlogPost extends PostFrontmatter {
	path: string
	permalink: `/blog/${string}`
	tagSlugs: string[]
	categorySlug: BlogCategory
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
	name: BlogCategory
	slug: BlogCategory
	count: number
}

export interface TagResult {
	tag: TagSummary
	posts: BlogPost[]
}
