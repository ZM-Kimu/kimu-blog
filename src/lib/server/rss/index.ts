import { siteConfig } from '$lib/constants/site';
import type { BlogPost } from '$lib/types/content';

const escapeXml = (value: string) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');

export function buildRssXml(posts: BlogPost[]) {
	const items = posts
		.map(
			(post) => `
		<item>
			<title>${escapeXml(post.title)}</title>
			<link>${new URL(post.permalink, siteConfig.url).toString()}</link>
			<guid>${new URL(post.permalink, siteConfig.url).toString()}</guid>
			<pubDate>${new Date(post.date).toUTCString()}</pubDate>
			<description>${escapeXml(post.description)}</description>
		</item>`
		)
		.join('');

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
	<channel>
		<title>${escapeXml(siteConfig.name)}</title>
		<link>${siteConfig.url}</link>
		<description>${escapeXml(siteConfig.description)}</description>
		${items}
	</channel>
</rss>`;
}
