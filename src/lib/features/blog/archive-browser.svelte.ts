/* eslint-disable svelte/no-navigation-without-resolve */
import { browser } from '$app/environment'
import { replaceState } from '$app/navigation'
import { resolve } from '$app/paths'
import { page } from '$app/state'

import type { BlogPost } from '$lib/types/content'

const archiveBasePath = '/blog/archive' as const

function isArchiveLocation() {
	return window.location.pathname === resolve(archiveBasePath)
}

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

function replaceArchiveUrl(query: string) {
	if (!browser) {
		return
	}

	const href = query ? `${resolve(archiveBasePath)}?${query}` : resolve(archiveBasePath)

	try {
		replaceState(href, page.state)
	} catch (error) {
		if (error instanceof Error && error.message.includes('before router is initialized')) {
			window.history.replaceState(window.history.state, '', href)
			return
		}

		throw error
	}
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

		if (!isArchiveLocation()) {
			return
		}

		this.requestedCategory = readSearchParam(window.location.search, 'category')
		this.selectedSlug = readSearchParam(window.location.search, 'post')
	}

	selectPost(slug: string) {
		if (browser) {
			const query = this.buildQuery(this.requestedCategory, slug)
			replaceArchiveUrl(query)
		}

		this.selectedSlug = slug
	}

	selectCategory(slug: string | null, firstSlug: string | null) {
		if (browser) {
			const query = this.buildQuery(slug, firstSlug)
			replaceArchiveUrl(query)
		}

		this.requestedCategory = slug
		this.selectedSlug = firstSlug
	}

	ensureValidSelection(posts: BlogPost[], options: { autoSelectFirst?: boolean } = {}) {
		if (this.selectedSlug && posts.some((post) => post.slug === this.selectedSlug)) {
			return
		}

		const nextSelectedSlug = options.autoSelectFirst ? (posts[0]?.slug ?? null) : null
		if (this.selectedSlug === nextSelectedSlug) {
			return
		}

		if (browser) {
			const query = this.buildQuery(this.requestedCategory, nextSelectedSlug)
			replaceArchiveUrl(query)
		}

		this.selectedSlug = nextSelectedSlug
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
