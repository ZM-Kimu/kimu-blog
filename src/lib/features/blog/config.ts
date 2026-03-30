export interface MissionDefinition {
	slug: string
	id: 'engineering' | 'designLog' | 'fieldNotes' | 'favorites'
	href: '/blog/archive' | '/favorites'
	matches: string[]
	tone: 'cyan' | 'blue' | 'amber' | 'slate'
}

export const missionCatalog: MissionDefinition[] = [
	{
		slug: 'engineering',
		id: 'engineering',
		href: '/blog/archive',
		matches: ['engineering', '工程'],
		tone: 'cyan'
	},
	{
		slug: 'design-log',
		id: 'designLog',
		href: '/blog/archive',
		matches: ['design-log', '设计', '设计记录'],
		tone: 'blue'
	},
	{
		slug: 'field-notes',
		id: 'fieldNotes',
		href: '/blog/archive',
		matches: ['field-notes', '随笔', '笔记', 'notes'],
		tone: 'amber'
	},
	{
		slug: 'favorites',
		id: 'favorites',
		href: '/favorites',
		matches: ['favorites'],
		tone: 'slate'
	}
]
