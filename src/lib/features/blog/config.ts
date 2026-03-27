export interface MissionDefinition {
	slug: string;
	title: string;
	kicker: string;
	description: string;
	href: string;
	matches: string[];
	state: string;
	tone: 'cyan' | 'blue' | 'amber' | 'slate';
}

export const missionCatalog: MissionDefinition[] = [
	{
		slug: 'engineering',
		title: 'Engineering',
		kicker: 'Mission 01',
		description: 'SvelteKit, Cloudflare, tooling, architecture notes, and implementation logs.',
		href: '/blog/archive',
		matches: ['engineering', '工程'],
		state: 'Live',
		tone: 'cyan'
	},
	{
		slug: 'design-log',
		title: 'Design Log',
		kicker: 'Mission 02',
		description:
			'Interaction studies, layout thinking, typography choices, and style system records.',
		href: '/blog/archive',
		matches: ['design-log', '设计', '设计记录'],
		state: 'Standby',
		tone: 'blue'
	},
	{
		slug: 'field-notes',
		title: 'Field Notes',
		kicker: 'Mission 03',
		description: 'Short-form observations, references, experiments, and personal notes.',
		href: '/blog/archive',
		matches: ['field-notes', '随笔', '笔记', 'notes'],
		state: 'Standby',
		tone: 'amber'
	},
	{
		slug: 'favorites',
		title: 'Favorites',
		kicker: 'Mission 04',
		description: 'Curated links, saved references, and collected inspirations.',
		href: '/favorites',
		matches: ['favorites'],
		state: 'Coming Soon',
		tone: 'slate'
	}
];
