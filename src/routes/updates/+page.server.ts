import { getUpdatesPageData } from '$lib/server/content/updates'

export const prerender = true

export function load() {
	return getUpdatesPageData()
}
