import { getPostBySlug, getPostEntries, getRelatedPosts } from '$lib/server/content/posts'
import { error } from '@sveltejs/kit'

export const prerender = true

export function entries() {
	return getPostEntries()
}

export function load({ params }) {
	const post = getPostBySlug(params.slug)

	if (!post) {
		throw error(404, 'post_not_found')
	}

	return {
		post,
		relatedPosts: getRelatedPosts(post)
	}
}
