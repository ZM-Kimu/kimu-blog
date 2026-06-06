<script lang="ts">
	import { browser } from '$app/environment'
	import { resolve } from '$app/paths'

	import ScrollChrome from '$lib/components/ui/ScrollChrome.svelte'
	import type { AppLocale } from '$lib/i18n/config'
	import type { BlogPost } from '$lib/types/content'
	import { formatDate } from '$lib/utils/date'
	import { onDestroy, tick } from 'svelte'

	let {
		posts,
		currentSlug,
		locale,
		listTitle,
		uncategorizedLabel
	}: {
		posts: BlogPost[]
		currentSlug: string
		locale?: AppLocale
		listTitle: string
		uncategorizedLabel: string
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

	function resolveViewport() {
		if (!browser || !railRoot) {
			dragViewport = null
			return
		}

		dragViewport = railRoot.querySelector('[data-scroll-chrome-viewport="true"]')
		updateListScrollState()
	}

	function scrollCurrentPostIntoView() {
		if (!browser || !dragViewport) {
			return
		}

		const currentItem = dragViewport.querySelector<HTMLElement>('[data-post-current="true"]')
		if (!currentItem) {
			updateListScrollState()
			return
		}

		const maxScrollTop = Math.max(dragViewport.scrollHeight - dragViewport.clientHeight, 0)
		const nextScrollTop = clamp(
			currentItem.offsetTop - (dragViewport.clientHeight - currentItem.offsetHeight) / 2,
			0,
			maxScrollTop
		)
		dragViewport.scrollTop = nextScrollTop
		updateListScrollState()
	}

	function handleListScroll() {
		updateListScrollState()
	}

	function scheduleCurrentPostAlignment() {
		if (!browser) {
			return
		}

		requestAnimationFrame(() => {
			scrollCurrentPostIntoView()
			requestAnimationFrame(() => {
				scrollCurrentPostIntoView()
			})
		})
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
		void currentSlug
		void posts.length

		if (!browser) {
			return
		}

		void tick().then(() => {
			resolveViewport()
			scheduleCurrentPostAlignment()
		})
	})

	$effect(() => {
		if (!dragViewport) {
			return
		}

		dragViewport.addEventListener('pointerdown', handlePointerDown)
		return () => {
			dragViewport?.removeEventListener('pointerdown', handlePointerDown)
		}
	})

	onDestroy(() => {
		releaseDragListeners?.()
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
		on:scroll={handleListScroll}
	>
		<nav class="post-list-items" aria-label={listTitle}>
			{#each posts as item (item.slug)}
				<a
					class:post-list-item-current={item.slug === currentSlug}
					class="post-list-item"
					data-post-current={item.slug === currentSlug ? 'true' : undefined}
					href={resolve(item.permalink)}
					aria-current={item.slug === currentSlug ? 'page' : undefined}
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
