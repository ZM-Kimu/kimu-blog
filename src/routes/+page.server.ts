import {
	getAllCategories,
	getAllPosts,
	getFeaturedPosts,
	getLatestPosts
} from '$lib/server/content/posts'

export const prerender = true

export function load() {
	return {
		featuredPost: getFeaturedPosts(1)[0] ?? getLatestPosts(1)[0] ?? null,
		latestPosts: getLatestPosts(3),
		categories: getAllCategories(),
		totalPosts: getAllPosts().length
	}
}
