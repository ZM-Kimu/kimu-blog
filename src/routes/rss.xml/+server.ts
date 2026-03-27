import { getAllPosts } from '$lib/server/content/posts'
import { buildRssXml } from '$lib/server/rss'

export const prerender = true

export function GET() {
	return new Response(buildRssXml(getAllPosts()), {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8'
		}
	})
}
