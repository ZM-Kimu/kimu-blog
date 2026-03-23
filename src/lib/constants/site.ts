import { env } from '$env/dynamic/public';

export const siteConfig = {
	name: env.PUBLIC_SITE_NAME || 'Kimu Blog',
	description: 'Content-first SvelteKit blog scaffold for Cloudflare Pages.',
	url: env.PUBLIC_SITE_URL || 'https://example.com',
	author: 'Kimu Team',
	ogImage: '/images/og-default.svg',
	nav: [
		{ href: '/', label: '首页' },
		{ href: '/blog', label: '文章' },
		{ href: '/about', label: '关于' }
	]
} as const;
