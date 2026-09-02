import { getFavoritesPageData } from '$lib/server/content/favorites'

export const prerender = true

export function load() {
	return getFavoritesPageData()
}
