export const enUSMessages = {
	meta: {
		localeName: 'English'
	},
	nav: {
		home: 'Home',
		blog: 'Missions',
		updates: 'Updates',
		favorites: 'Favorites',
		about: 'About'
	},
	blog: {
		archive: {
			short: 'Posts'
		}
	},
	common: {
		back: 'Back',
		home: 'Home',
		published: 'Published',
		updated: 'Updated',
		readingTime: 'Reading time'
	},
	shell: {
		brand: {
			tagline: 'Command Center'
		},
		aria: {
			primaryNav: 'Primary navigation',
			quickNav: 'Quick access'
		},
		status: {
			current: 'Current',
			mode: 'Mode',
			stack: 'Stack',
			deploy: 'Deploy'
		},
		section: {
			archive: 'Archive',
			dossier: 'Dossier',
			interface: 'Interface'
		},
		toggle: {
			expand: 'Expand',
			collapse: 'Collapse'
		},
		footer: {
			lead: 'Light futuristic command center for articles, logs, and curated references.',
			detail: 'Built with SvelteKit, mdsvex, schema validation, and prerender-first routing.'
		}
	},
	home: {
		mode: {
			main: 'Main',
			subpage: 'Subpage'
		},
		action: {
			enterContent: 'Enter content'
		}
	},
	error: {
		notFound: 'Page not found~ (´・ω・`)',
		failure: 'System fault detected (´；ω；`)'
	}
} as const;
