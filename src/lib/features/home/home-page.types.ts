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
}

export type HomePageMissionPreviewItem = {
	slug: string
	title: string
	kicker: string
	href: '/blog/archive' | '/favorites'
	state: string
	tone: 'cyan' | 'blue' | 'amber' | 'slate'
	count: number
}
