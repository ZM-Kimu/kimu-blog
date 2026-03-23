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

export const hudStatusChips = [
	{ label: 'Mode', value: 'LIVE' },
	{ label: 'Stack', value: 'SVELTEKIT' },
	{ label: 'Deploy', value: 'PAGES' }
] as const;

export const commandNotices = [
	{
		kicker: 'Signal 01',
		title: 'Current Build Focus',
		copy: 'Command Center UI, mission board routing, and dossier-style reading mode are active.'
	},
	{
		kicker: 'Signal 02',
		title: 'Content Pipeline',
		copy: 'Markdown, schema validation, prerender entries, and Cloudflare Pages delivery remain online.'
	},
	{
		kicker: 'Signal 03',
		title: 'Asset Policy',
		copy: 'Illustration, card art, and banners stay placeholder-first in this phase.'
	}
] as const;

export const homeStatusFeed = [
	{ label: 'Status', value: 'Building the blog as a playable interface.' },
	{ label: 'Focus', value: 'SvelteKit UI systems, motion, and content architecture.' },
	{ label: 'Output', value: 'Articles, logs, references, and curated favorites.' }
] as const;

export const commandHighlights = [
	{
		kicker: 'Profile',
		title: 'Operator Identity',
		copy: 'Personal command deck for essays, engineering notes, and interface experiments.'
	},
	{
		kicker: 'System',
		title: 'Readable by Design',
		copy: 'Game-like structure for navigation, calmer reading surfaces for long-form content.'
	},
	{
		kicker: 'Mission',
		title: 'Category Hub',
		copy: 'Primary categories become the main selection layer instead of a flat article wall.'
	}
] as const;

export const homeDockItems = [
	{ href: '/blog/archive', label: '文章', code: '16', accent: 'archive' },
	{ href: '/blog', label: '分类', code: '17', accent: 'mission' },
	{ href: '/updates', label: '动态', code: '18', accent: 'live' },
	{ href: '/favorites', label: '收藏', code: '19', accent: 'vault' },
	{ href: '/about', label: '关于', code: '20', accent: 'profile' }
] as const;

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
