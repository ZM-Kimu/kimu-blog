export const appShellNav = [
	{ href: '/', labelKey: 'nav.home', code: 'H01' },
	{ href: '/blog', labelKey: 'nav.blog', code: 'M02' },
	{ href: '/updates', labelKey: 'nav.updates', code: 'L03' },
	{ href: '/favorites', labelKey: 'nav.favorites', code: 'F04' },
	{ href: '/about', labelKey: 'nav.about', code: 'I05' }
] as const

export const hudStatusChips = [
	{ labelKey: 'shell.status.mode', valueKey: 'shell.status.modeValue' },
	{ labelKey: 'shell.status.stack', valueKey: 'shell.status.stackValue' },
	{ labelKey: 'shell.status.deploy', valueKey: 'shell.status.deployValue' }
] as const
