<script lang="ts">
	import { browser } from '$app/environment'
	import { resolve } from '$app/paths'

	import ScrollChrome from '$lib/components/ui/ScrollChrome.svelte'
	import type { AppLocale } from '$lib/i18n/config'
	import type { BlogPost } from '$lib/types/content'
	import { formatDate } from '$lib/utils/date'
	import { onDestroy, tick } from 'svelte'
	import { animateScrollTop } from '../post-motion'

	let {
		posts,
		currentSlug,
		locale,
		listTitle,
		uncategorizedLabel,
		alignDurationMs,
		scrollEasePower,
		motionEnabled,
		onSelectPost
	}: {
		posts: BlogPost[]
		currentSlug: string
		locale?: AppLocale
		listTitle: string
		uncategorizedLabel: string
		alignDurationMs: number
		scrollEasePower: number
		motionEnabled: boolean
		onSelectPost?: (post: BlogPost, event: MouseEvent) => void
	} = $props()

	let railRoot: HTMLElement | null = $state(null)
	let dragViewport: HTMLDivElement | null = $state(null)
	let listOverflowing = $state(false)
	let listCanScrollForward = $state(false)
	let dragActive = false
	let dragMoved = false
	let suppressClick = false
	let dragPointerId = -1
	let dragStartY = 0
	let dragStartScrollTop = 0
	let releaseDragListeners: (() => void) | null = null
	let cancelAlignment: (() => void) | null = null
	let alignedSlug: string | null = null

	function clamp(value: number, min: number, max: number) {
		return Math.min(Math.max(value, min), max)
	}

	function updateListScrollState() {
		if (!dragViewport) {
			listOverflowing = false
			listCanScrollForward = false
			return
		}

		listOverflowing = dragViewport.scrollHeight - dragViewport.clientHeight > 1
		listCanScrollForward =
			listOverflowing &&
			dragViewport.scrollTop + dragViewport.clientHeight < dragViewport.scrollHeight - 1
	}

	function findPostItem(slug: string) {
		if (!dragViewport) {
			return null
		}

		return (
			Array.from(dragViewport.querySelectorAll<HTMLElement>('[data-post-slug]')).find(
				(item) => item.dataset.postSlug === slug
			) ?? null
		)
	}

	function scrollPostIntoView(slug: string, animated: boolean) {
		if (!browser || !dragViewport) {
			return
		}

		const postItem = findPostItem(slug)
		if (!postItem) {
			updateListScrollState()
			return
		}

		const maxScrollTop = Math.max(dragViewport.scrollHeight - dragViewport.clientHeight, 0)
		const nextScrollTop = clamp(
			postItem.offsetTop - (dragViewport.clientHeight - postItem.offsetHeight) / 2,
			0,
			maxScrollTop
		)
		cancelAlignment?.()
		const alignment = animateScrollTop(
			dragViewport,
			nextScrollTop,
			animated ? alignDurationMs : 1,
			scrollEasePower
		)
		cancelAlignment = alignment.cancel
		void alignment.finished.then(() => {
			if (cancelAlignment === alignment.cancel) {
				cancelAlignment = null
			}
			updateListScrollState()
		})
	}

	function handleListScroll() {
		updateListScrollState()
	}

	function schedulePostAlignment(slug: string, animated: boolean) {
		if (!browser) {
			return
		}

		requestAnimationFrame(() => {
			scrollPostIntoView(slug, animated)
			requestAnimationFrame(() => {
				if (!animated) {
					scrollPostIntoView(slug, false)
				}
			})
		})
	}

	export function alignToSlug(slug: string, animated = true) {
		alignedSlug = slug
		schedulePostAlignment(slug, animated && motionEnabled)
	}

	function handlePointerDown(event: PointerEvent) {
		if (!dragViewport) {
			return
		}

		if (event.button !== 0) {
			return
		}

		const target = event.target as Element | null
		if (target?.closest('.scroll-chrome-track, .scroll-chrome-thumb')) {
			return
		}

		cancelAlignment?.()
		cancelAlignment = null

		dragActive = true
		dragMoved = false
		suppressClick = false
		dragPointerId = event.pointerId
		dragStartY = event.clientY
		dragStartScrollTop = dragViewport.scrollTop

		const handlePointerMove = (moveEvent: PointerEvent) => {
			if (!dragActive || !dragViewport || moveEvent.pointerId !== dragPointerId) {
				return
			}

			const deltaY = moveEvent.clientY - dragStartY
			if (!dragMoved && Math.abs(deltaY) >= 4) {
				dragMoved = true
				suppressClick = true
			}

			if (!dragMoved) {
				return
			}

			moveEvent.preventDefault()
			dragViewport.scrollTop = dragStartScrollTop - deltaY
			updateListScrollState()
		}

		const stopDrag = (stopEvent: PointerEvent) => {
			if (!dragActive || stopEvent.pointerId !== dragPointerId) {
				return
			}

			releaseDragListeners?.()
			releaseDragListeners = null
			dragActive = false
			dragPointerId = -1
		}

		window.addEventListener('pointermove', handlePointerMove, { passive: false })
		window.addEventListener('pointerup', stopDrag)
		window.addEventListener('pointercancel', stopDrag)
		releaseDragListeners = () => {
			window.removeEventListener('pointermove', handlePointerMove)
			window.removeEventListener('pointerup', stopDrag)
			window.removeEventListener('pointercancel', stopDrag)
		}
	}

	function handleClickCapture(event: MouseEvent) {
		if (!suppressClick) {
			return
		}

		event.preventDefault()
		event.stopPropagation()
		dragMoved = false
		suppressClick = false
	}

	$effect(() => {
		const nextSlug = currentSlug
		void posts.length

		if (!browser) {
			return
		}

		void tick().then(() => {
			updateListScrollState()
			if (alignedSlug === nextSlug) {
				return
			}

			const animated = motionEnabled && alignedSlug !== null
			alignedSlug = nextSlug
			schedulePostAlignment(nextSlug, animated)
		})
	})

	$effect(() => {
		if (!dragViewport) {
			return
		}

		dragViewport.addEventListener('pointerdown', handlePointerDown)
		const cancelScrollAlignment = () => {
			cancelAlignment?.()
			cancelAlignment = null
		}
		dragViewport.addEventListener('wheel', cancelScrollAlignment, { passive: true })
		return () => {
			dragViewport?.removeEventListener('pointerdown', handlePointerDown)
			dragViewport?.removeEventListener('wheel', cancelScrollAlignment)
		}
	})

	onDestroy(() => {
		releaseDragListeners?.()
		cancelAlignment?.()
	})
</script>

<aside
	bind:this={railRoot}
	class="post-list-rail"
	aria-label={listTitle}
	onclickcapture={handleClickCapture}
>
	<ScrollChrome
		axis="y"
		class="post-list-scroll"
		viewportClass="post-list-viewport"
		bind:viewport={dragViewport}
		on:scroll={handleListScroll}
	>
		<nav class="post-list-items" aria-label={listTitle}>
			{#each posts as item (item.slug)}
				<a
					class:post-list-item-current={item.slug === currentSlug}
					class="post-list-item"
					data-post-current={item.slug === currentSlug ? 'true' : undefined}
					data-post-slug={item.slug}
					href={resolve(item.permalink)}
					aria-current={item.slug === currentSlug ? 'page' : undefined}
					data-sveltekit-preload-data="hover"
					onclick={(event) => onSelectPost?.(item, event)}
				>
					<strong>{item.title}</strong>
					<span>{item.category ?? uncategorizedLabel}</span>
					<time datetime={item.date}>{formatDate(item.date, locale)}</time>
				</a>
			{/each}
		</nav>
	</ScrollChrome>

	{#if listCanScrollForward}
		<div class="post-list-scroll-hint" aria-hidden="true">
			<span class="post-list-scroll-hint-arrow">
				<svg viewBox="0 0 16 16" focusable="false" aria-hidden="true">
					<path d="M3.5 5.5L8 10l4.5-4.5" />
				</svg>
			</span>
		</div>
	{/if}
</aside>
