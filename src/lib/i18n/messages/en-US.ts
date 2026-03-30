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
	topbar: {
		actions: {
			language: 'Toggle language',
			collapse: 'Collapse top bar',
			settings: 'Open settings',
			home: 'Return home',
			expand: 'Expand top bar'
		},
		metrics: {
			articles: 'Site articles',
			todos: 'Open todos',
			recentActivity: 'Posts added or updated in the last 30 days'
		},
		settings: {
			title: 'Site Settings',
			close: 'Close settings',
			cursor: 'Cursor Style',
			cursorDescription: 'Switch between the in-world pointer and the browser default cursor.',
			custom: 'Custom',
			system: 'System',
			backgroundAnimation: 'Background Animation',
			backgroundAnimationDescription:
				'Enable the Spine-powered animated background layer for home.',
			backgroundAnimationOn: 'On',
			backgroundAnimationOff: 'Off',
			backgroundAnimationDisabled: 'Automatically disabled on compact layout or reduced motion.',
			backgroundAnimationFailed: 'Asset loading failed, so the default background is being used.',
			manage: 'Manage Workbench',
			manageDescription:
				'Open the content maintenance panel for posts, editor states, and repository writes.',
			manageAction: 'Open'
		}
	},
	error: {
		notFound: 'Page not found~ (´・ω・`)',
		failure: 'System fault detected (´；ω；`)'
	}
} as const
