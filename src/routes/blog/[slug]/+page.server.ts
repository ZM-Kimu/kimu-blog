import {
	getAllPosts,
	getPostBySlug,
	getPostEntries,
	getPostSeriesNavigation,
	getRelatedPosts
} from '$lib/server/content/posts'
import { error } from '@sveltejs/kit'

const postModules = import.meta.glob('/src/lib/content/blog/*.{md,svx}')
const postEntries = getPostEntries()

export const prerender = postEntries.length > 0

export function entries() {
	return postEntries
}

export function load({ params }) {
	const post = getPostBySlug(params.slug)

	if (!post) {
		throw error(404, 'post_not_found')
	}

	if (!postModules[post.path]) {
		throw error(404, 'post_module_missing')
	}

	return {
		post,
		allPosts: getAllPosts(),
		seriesNavigation: getPostSeriesNavigation(post),
		relatedPosts: getRelatedPosts(post)
	}
}
