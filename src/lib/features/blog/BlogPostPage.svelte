<script module lang="ts">
	import type { Component } from 'svelte'

	type BlogContentModule = {
		default: Component<Record<string, never>>
	}

	const modules = import.meta.glob('/src/lib/content/blog/*.{md,svx}', {
		eager: true
	}) as Record<string, BlogContentModule>
</script>

<script lang="ts">
	import { browser } from '$app/environment'
	import { page } from '$app/state'
	import ScrollChrome from '$lib/components/ui/ScrollChrome.svelte'
	import { translate } from '$lib/i18n'
	import { getPublicLayoutContext } from '$lib/layout/public-layout'
	import { getMotionTokens } from '$lib/motion/tokens'
	import { getNavigationContext } from '$lib/navigation/context'
	import { fade, fly } from 'svelte/transition'
	import { onDestroy } from 'svelte'

	import BlogPostBody from './components/BlogPostBody.svelte'
	import BlogPostListRail from './components/BlogPostListRail.svelte'
	import BlogPostSidebar from './components/BlogPostSidebar.svelte'

	let { data } = $props()
	const { navigationManager } = getNavigationContext()
	const publicLayout = getPublicLayoutContext()
	const isLandscapeLayout = $derived(publicLayout.getMode() === 'landscape')
	const isPostTopbarCollapsed = $derived(isLandscapeLayout && navigationManager.topbarCollapsed)
	const messages = $derived(page.data.i18n?.messages)
	const locale = $derived(page.data.i18n?.locale)
	const reducedMotion = browser
		? window.matchMedia('(prefers-reduced-motion: reduce)').matches
		: false
	const blogMotion = getMotionTokens({ portrait: false, reducedMotion }).blog
	const t = (key: string, params?: Record<string, string | number>) =>
		translate(messages, key, params)

	const Content = $derived(modules[data.post.path]?.default ?? null)
	const postTransitionKey = $derived(data.post.slug)

	let lastReaderScrollTop = 0
	let readerScrollIntent = 0
	let readerScrollPrimed = false
	let readerCollapsedTopbar = false
	let readerTopbarScrollLockUntil = 0

	const readerScrollThreshold = 18
	const readerTopResetThreshold = 12
	const readerTopbarScrollLockMs = (() => {
		const topbarMotion = getMotionTokens({ portrait: false, reducedMotion }).topbar
		return topbarMotion.stageDurationMs + topbarMotion.stageCollapseDelayMs
	})()

	function postReaderSwap(node: Element) {
		return fly(node, {
			y: blogMotion.postReaderSwapOffsetYPx,
			duration: blogMotion.postReaderSwapDurationMs,
			opacity: 0
		})
	}

	function postAsideSwap(node: Element) {
		return fly(node, {
			y: blogMotion.postAsideSwapOffsetYPx,
			duration: blogMotion.postAsideSwapDurationMs,
			opacity: 0
		})
	}

	function postAsideFade(node: Element) {
		return fade(node, {
			duration: blogMotion.postAsideSwapDurationMs
		})
	}

	function lockReaderTopbarScroll(scrollTop: number) {
		readerTopbarScrollLockUntil = performance.now() + readerTopbarScrollLockMs
		readerScrollIntent = 0
		lastReaderScrollTop = scrollTop
	}

	function handleReaderScroll(event: CustomEvent<{ scrollTop: number; scrollLeft: number }>) {
		if (!isLandscapeLayout) {
			return
		}

		const nextScrollTop = event.detail.scrollTop
		if (!readerScrollPrimed) {
			lastReaderScrollTop = nextScrollTop
			readerScrollPrimed = true
			return
		}

		if (performance.now() < readerTopbarScrollLockUntil) {
			lastReaderScrollTop = nextScrollTop
			return
		}

		const delta = nextScrollTop - lastReaderScrollTop
		lastReaderScrollTop = nextScrollTop

		if (nextScrollTop <= readerTopResetThreshold) {
			readerScrollIntent = 0
			if (navigationManager.topbarCollapsed) {
				navigationManager.toggleTopbarCollapsed(false)
				lockReaderTopbarScroll(nextScrollTop)
			}
			readerCollapsedTopbar = false
			return
		}

		if (Math.abs(delta) < 1) {
			return
		}

		if (readerScrollIntent !== 0 && Math.sign(readerScrollIntent) !== Math.sign(delta)) {
			readerScrollIntent = 0
		}

		readerScrollIntent += delta

		if (readerScrollIntent >= readerScrollThreshold) {
			if (!navigationManager.topbarCollapsed) {
				navigationManager.toggleTopbarCollapsed(true)
				readerCollapsedTopbar = true
				lockReaderTopbarScroll(nextScrollTop)
			}
			readerScrollIntent = 0
			return
		}

		if (readerScrollIntent <= -readerScrollThreshold) {
			if (navigationManager.topbarCollapsed) {
				navigationManager.toggleTopbarCollapsed(false)
				lockReaderTopbarScroll(nextScrollTop)
			}
			readerCollapsedTopbar = false
			readerScrollIntent = 0
		}
	}

	function handleReaderWheelIntent(
		event: CustomEvent<{
			deltaX: number
			deltaY: number
			scrollTop: number
			scrollLeft: number
			hasXOverflow: boolean
			hasYOverflow: boolean
		}>
	) {
		if (!isLandscapeLayout) {
			return
		}

		const { deltaY, hasYOverflow, scrollTop } = event.detail
		if (hasYOverflow || deltaY >= -1) {
			return
		}

		if (performance.now() < readerTopbarScrollLockUntil) {
			return
		}

		if (navigationManager.topbarCollapsed) {
			navigationManager.toggleTopbarCollapsed(false)
			readerCollapsedTopbar = false
			lockReaderTopbarScroll(scrollTop)
		}
	}

	onDestroy(() => {
		if (readerCollapsedTopbar && navigationManager.topbarCollapsed) {
			navigationManager.toggleTopbarCollapsed(false)
		}
	})
</script>

<section class:post-shell-topbar-collapsed={isPostTopbarCollapsed} class="post-shell">
	<div class="post-frame">
		<div class="post-layout">
			<div class="post-list-lane">
				<BlogPostListRail
					posts={data.allPosts}
					currentSlug={data.post.slug}
					{locale}
					listTitle={t('blog.post.listTitle')}
					uncategorizedLabel={t('common.uncategorized')}
				/>
			</div>

			<div class="post-reader-lane">
				<ScrollChrome
					class="post-reader-scroll"
					viewportClass="post-reader-viewport"
					on:scroll={handleReaderScroll}
					on:wheelintent={handleReaderWheelIntent}
				>
					<div class="post-reader-transition-host">
						{#key postTransitionKey}
							<article class="post-reader-stage" in:postReaderSwap out:postReaderSwap>
								<BlogPostBody post={data.post} {Content} />
							</article>
						{/key}
					</div>
				</ScrollChrome>
			</div>

			<div class="post-aside-lane">
				<BlogPostSidebar
					post={data.post}
					transitionKey={postTransitionKey}
					{locale}
					metadataTitle={t('common.info')}
					categoryLabel={t('common.category')}
					publishedAtLabel={t('common.publishedAt').replace('{date}', '').trim()}
					updatedAtLabel={t('common.updatedAt').replace('{date}', '').trim()}
					uncategorizedLabel={t('common.uncategorized')}
					contentTransition={postAsideSwap}
					contentFadeTransition={postAsideFade}
				/>
			</div>
		</div>
	</div>
</section>
