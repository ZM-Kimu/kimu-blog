import { siteConfig } from '$lib/config/site'
import type { BlogPost, TagSummary } from '$lib/types/content'

export function buildSitemapXml(posts: BlogPost[], tags: TagSummary[]) {
	const urls = [
		'/',
		'/blog',
		'/about',
		...posts.map((post) => post.permalink),
		...tags.map((tag) => `/tags/${tag.slug}`)
	]
		.map(
			(pathname) => `
	<url>
		<loc>${new URL(pathname, siteConfig.url).toString()}</loc>
	</url>`
		)
		.join('')

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	${urls}
</urlset>`
}
