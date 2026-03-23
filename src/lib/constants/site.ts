import { env } from '$env/dynamic/public';

export const siteConfig = {
	name: env.PUBLIC_SITE_NAME || 'Kimu Blog',
	description:
		'Game UI inspired personal command center built with SvelteKit and Cloudflare Pages.',
	url: env.PUBLIC_SITE_URL || 'https://example.com',
	author: 'Kimu',
	ogImage: '/images/og-default.svg',
	nav: [
		{ href: '/', label: '首页', code: 'H01' },
		{ href: '/blog', label: '分类', code: 'M02' },
		{ href: '/updates', label: '动态', code: 'L03' },
		{ href: '/favorites', label: '收藏', code: 'F04' },
		{ href: '/about', label: '关于', code: 'I05' }
	]
} as const;
