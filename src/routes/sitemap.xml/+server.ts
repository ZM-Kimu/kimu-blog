import { getAllPosts, getAllTags } from '$lib/server/content/posts'
import { buildSitemapXml } from '$lib/server/sitemap'

export const prerender = true

export function GET() {
	return new Response(buildSitemapXml(getAllPosts(), getAllTags()), {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8'
		}
	})
}
