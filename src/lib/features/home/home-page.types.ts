import type { TopbarMetricsData } from '$lib/navigation/types'
import type { BlogCategory } from '$lib/content/blog-categories'

export type HomePageCategory = {
	slug: BlogCategory
	name: BlogCategory
	count: number
}

export type HomePageFeaturedPost = {
	permalink: `/blog/${string}`
	title: string
	category: BlogCategory
}

export type HomePageData = {
	featuredPost: HomePageFeaturedPost | null
	categories: HomePageCategory[]
	totalPosts: number
	topbarMetrics?: TopbarMetricsData
}

export type HomePageMissionPreviewItem = {
	slug: string
	id: BlogCategory | 'favorites'
	href: `/blog/archive?category=${string}` | '/favorites'
	tone: 'cyan' | 'blue' | 'amber' | 'slate'
	count: number
}
