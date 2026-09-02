import { getAllTags, getPostsByTag, getTagEntries } from '$lib/server/content/posts'
import { error } from '@sveltejs/kit'

const tagEntries = getTagEntries()

export const prerender = tagEntries.length > 0

export function entries() {
	return tagEntries
}

export function load({ params }) {
	const result = getPostsByTag(params.tag)

	if (!result) {
		throw error(404, 'tag_not_found')
	}

	return {
		...result,
		allTags: getAllTags()
	}
}
