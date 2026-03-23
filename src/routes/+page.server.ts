import { getAllTags, getLatestPosts } from '$lib/server/content/posts';

export const prerender = true;

export function load() {
	return {
		latestPosts: getLatestPosts(3),
		tags: getAllTags()
	};
}
