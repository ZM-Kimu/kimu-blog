import { getPostsByTag, getTagEntries } from '$lib/server/content/posts'
import { error } from '@sveltejs/kit'

export const prerender = true

export function entries() {
	return getTagEntries()
}

export function load({ params }) {
	const result = getPostsByTag(params.tag)

	if (!result) {
		throw error(404, 'tag_not_found')
	}

	return result
}
