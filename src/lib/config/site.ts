import { env } from '$env/dynamic/public'

export const siteConfig = {
	name: env.PUBLIC_SITE_NAME || 'Kimu Blog',
	description:
		'Game UI inspired personal command center built with SvelteKit and Cloudflare Pages.',
	url: env.PUBLIC_SITE_URL || 'https://example.com',
	author: 'Kimu',
	ogImage: '/images/og-default.svg',
	github: {
		owner: env.PUBLIC_GITHUB_REPO_OWNER || 'ZM-Kimu',
		repo: env.PUBLIC_GITHUB_REPO_NAME || 'kimu-blog'
	}
} as const
