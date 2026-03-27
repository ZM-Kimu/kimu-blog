export const homeQuickActions = [
	{ href: '/updates', labelKey: 'nav.updates', accent: 'live' },
	{ href: '/favorites', labelKey: 'nav.favorites', accent: 'vault' },
	{ href: '/blog/archive', labelKey: 'blog.archive.short', accent: 'archive' },
	{ href: '/about', labelKey: 'nav.about', accent: 'profile' }
] as const;

export const homeDockItems = [
	{ href: '/blog/archive', labelKey: 'blog.archive.short', code: '16', accent: 'archive' },
	{ href: '/blog', labelKey: 'nav.blog', code: '17', accent: 'mission' },
	{ href: '/updates', labelKey: 'nav.updates', code: '18', accent: 'live' },
	{ href: '/favorites', labelKey: 'nav.favorites', code: '19', accent: 'vault' },
	{ href: '/about', labelKey: 'nav.about', code: '20', accent: 'profile' }
] as const;
