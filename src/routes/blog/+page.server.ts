import { getAllCategories, getAllPosts, getLatestPosts } from '$lib/server/content/posts';

export const prerender = true;

export function load() {
	return {
		categories: getAllCategories(),
		latestPosts: getLatestPosts(4),
		totalPosts: getAllPosts().length
	};
}
