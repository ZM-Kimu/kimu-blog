const { PUBLIC_GITHUB_REPO_NAME, PUBLIC_GITHUB_REPO_OWNER, PUBLIC_SITE_NAME, PUBLIC_SITE_URL } =
	import.meta.env

export const siteConfig = {
	name: PUBLIC_SITE_NAME || 'Kimu Blog',
	url: PUBLIC_SITE_URL || 'https://example.com',
	author: 'ZM-Kimu',
	ogImage: '/images/og-default.svg',
	github: {
		owner: PUBLIC_GITHUB_REPO_OWNER || 'ZM-Kimu',
		repo: PUBLIC_GITHUB_REPO_NAME || 'kimu-blog'
	}
} as const
