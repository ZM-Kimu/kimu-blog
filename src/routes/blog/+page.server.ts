import { getAllCategories } from '$lib/server/content/posts'

export const prerender = true

export function load() {
	return {
		categories: getAllCategories()
	}
}
