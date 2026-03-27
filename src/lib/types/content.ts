import type { PostFrontmatter } from '$lib/content/schema'

export interface BlogPost extends PostFrontmatter {
	path: string
	permalink: `/blog/${string}`
	tagSlugs: string[]
	categorySlug: string | null
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

export interface ArchiveCategoryGroup {
	category: CategorySummary
	posts: BlogPost[]
}

export interface ArchiveYearGroup {
	year: string
	posts: BlogPost[]
}
