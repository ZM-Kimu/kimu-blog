import type { BlogCategory } from '$lib/content/blog-categories'

export interface MissionDefinition {
	slug: string
	id: BlogCategory | 'favorites'
	href: `/blog/archive?category=${string}` | '/favorites'
	category: BlogCategory | null
	tone: 'cyan' | 'blue' | 'amber' | 'slate'
}

export const missionCatalog: MissionDefinition[] = [
	{
		slug: 'development',
		id: 'development',
		href: '/blog/archive?category=development',
		category: 'development',
		tone: 'cyan'
	},
	{
		slug: 'daily',
		id: 'daily',
		href: '/blog/archive?category=daily',
		category: 'daily',
		tone: 'blue'
	},
	{
		slug: 'notes',
		id: 'notes',
		href: '/blog/archive?category=notes',
		category: 'notes',
		tone: 'amber'
	},
	{
		slug: 'favorites',
		id: 'favorites',
		href: '/favorites',
		category: null,
		tone: 'slate'
	}
]
