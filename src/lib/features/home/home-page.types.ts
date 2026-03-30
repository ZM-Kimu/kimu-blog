import type { TopbarMetricsData } from '$lib/navigation/types'

export type HomePageCategory = {
	slug: string
	name: string
	count: number
}

export type HomePageFeaturedPost = {
	permalink: `/blog/${string}`
	title: string
	category?: string | null
}

export type HomePageData = {
	featuredPost: HomePageFeaturedPost | null
	categories: HomePageCategory[]
	totalPosts: number
	topbarMetrics?: TopbarMetricsData
}

export type HomePageMissionPreviewItem = {
	slug: string
	id: 'engineering' | 'designLog' | 'fieldNotes' | 'favorites'
	href: '/blog/archive' | '/favorites'
	tone: 'cyan' | 'blue' | 'amber' | 'slate'
	count: number
}
