/* eslint-disable svelte/no-navigation-without-resolve */
import { browser } from '$app/environment'
import { replaceState } from '$app/navigation'
import { resolve } from '$app/paths'
import { page } from '$app/state'

import type { BlogPost } from '$lib/types/content'

const archiveBasePath = '/blog/archive' as const

function readSearchParam(search: string, key: string) {
	if (!search.startsWith('?')) {
		return null
	}

	for (const entry of search.slice(1).split('&')) {
		if (!entry) {
			continue
		}

		const [rawKey, rawValue = ''] = entry.split('=')
		if (decodeURIComponent(rawKey) !== key) {
			continue
		}

		return decodeURIComponent(rawValue)
	}

	return null
}

export class ArchiveBrowserState {
	requestedCategory = $state<string | null>(null)
	selectedSlug = $state<string | null>(null)

	syncFromLocation() {
		if (!browser) {
			this.requestedCategory = null
			this.selectedSlug = null
			return
		}

		this.requestedCategory = readSearchParam(window.location.search, 'category')
		this.selectedSlug = readSearchParam(window.location.search, 'post')
	}

	selectPost(slug: string) {
		if (browser) {
			const query = this.buildQuery(this.requestedCategory, slug)
			replaceState(
				query ? `${resolve(archiveBasePath)}?${query}` : resolve(archiveBasePath),
				page.state
			)
		}

		this.selectedSlug = slug
	}

	selectCategory(slug: string | null) {
		if (browser) {
			const query = this.buildQuery(slug, null)
			replaceState(
				query ? `${resolve(archiveBasePath)}?${query}` : resolve(archiveBasePath),
				page.state
			)
		}

		this.requestedCategory = slug
		this.selectedSlug = null
	}

	ensureValidSelection(posts: BlogPost[]) {
		if (!this.selectedSlug || posts.some((post) => post.slug === this.selectedSlug)) {
			return
		}

		if (browser) {
			const query = this.buildQuery(this.requestedCategory, null)
			replaceState(
				query ? `${resolve(archiveBasePath)}?${query}` : resolve(archiveBasePath),
				page.state
			)
		}

		this.selectedSlug = null
	}

	buildQuery(
		nextCategory: string | null = this.requestedCategory,
		nextPost: string | null = this.selectedSlug
	) {
		const queryParts = [
			nextCategory ? `category=${encodeURIComponent(nextCategory)}` : null,
			nextPost ? `post=${encodeURIComponent(nextPost)}` : null
		].filter((entry): entry is string => entry !== null)
		return queryParts.join('&')
	}
}

export function createArchiveBrowserState() {
	return new ArchiveBrowserState()
}
