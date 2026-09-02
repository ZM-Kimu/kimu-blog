export const homeQuickActions = [
	{ href: '/updates', labelKey: 'nav.updates', accent: 'live' },
	{ href: '/favorites', labelKey: 'nav.favorites', accent: 'vault' },
	{ href: '/blog/archive', labelKey: 'blog.archive.short', accent: 'archive' },
	{ href: '/about', labelKey: 'nav.about', accent: 'profile' }
] as const

export const homeDockItems = [
	{ href: '/blog/archive', labelKey: 'shell.section.dossier', accent: 'archive' },
	{ href: '/updates', labelKey: 'nav.updates', accent: 'live' },
	{ href: '/favorites', labelKey: 'nav.favorites', accent: 'vault' },
	{ href: '/blog', labelKey: 'nav.blog', accent: 'tags' }
] as const
