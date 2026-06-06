import {
	getAllPosts,
	getPostBySlug,
	getPostEntries,
	getRelatedPosts
} from '$lib/server/content/posts'
import { error } from '@sveltejs/kit'

const postModules = import.meta.glob('/src/lib/content/blog/*.{md,svx}')

export const prerender = true

export function entries() {
	return getPostEntries()
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
		relatedPosts: getRelatedPosts(post)
	}
}
