import { getAllCategories, getAllPosts } from '$lib/server/content/posts'

export const prerender = true

export function load() {
	const posts = getAllPosts()

	return {
		posts,
		categories: getAllCategories(),
		totalPosts: posts.length
	}
}
