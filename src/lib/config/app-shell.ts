export const appShellNav = [
	{ href: '/', labelKey: 'nav.home', code: 'H01' },
	{ href: '/blog', labelKey: 'nav.blog', code: 'M02' },
	{ href: '/updates', labelKey: 'nav.updates', code: 'L03' },
	{ href: '/favorites', labelKey: 'nav.favorites', code: 'F04' },
	{ href: '/about', labelKey: 'nav.about', code: 'I05' }
] as const;

export const hudStatusChips = [
	{ labelKey: 'shell.status.mode', value: 'LIVE' },
	{ labelKey: 'shell.status.stack', value: 'SVELTEKIT' },
	{ labelKey: 'shell.status.deploy', value: 'PAGES' }
] as const;
