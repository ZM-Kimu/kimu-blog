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
	import { beforeNavigate, goto, preloadData } from '$app/navigation'
	import { resolve } from '$app/paths'
	import { page } from '$app/state'
	import ScrollChrome from '$lib/components/ui/ScrollChrome.svelte'
	import { translate } from '$lib/i18n'
	import { getPublicLayoutContext } from '$lib/layout/public-layout'
	import { getMotionTokens } from '$lib/motion/tokens'
	import { getNavigationContext } from '$lib/navigation/context'
	import type { BlogPost } from '$lib/types/content'
	import { onDestroy, tick, untrack } from 'svelte'

	import BlogPostBody from './components/BlogPostBody.svelte'
	import BlogPostListRail from './components/BlogPostListRail.svelte'
	import BlogPostSidebar from './components/BlogPostSidebar.svelte'
	import { animatePostTextRows, animateScrollTop } from './post-motion'

	type CancelableMotion = {
		finished: Promise<void>
		cancel: (restore?: boolean) => void
	}

	type BlogPostSidebarHandle = {
		beginSwapOut: () => Promise<boolean>
		cancelSwap: () => void
	}

	type BlogPostListRailHandle = {
		alignToSlug: (slug: string, animated?: boolean) => void
	}

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
	const motionTokens = getMotionTokens({ portrait: false, reducedMotion })
	const blogMotion = motionTokens.blog
	const t = (key: string, params?: Record<string, string | number>) =>
		translate(messages, key, params)

	const Content = $derived(modules[data.post.path]?.default ?? null)
	const postTransitionKey = $derived(data.post.slug)
	let readerViewport: HTMLDivElement | null = $state(null)
	let readerStage: HTMLElement | null = $state(null)
	let postListRail: BlogPostListRailHandle | null = $state(null)
	let postSidebar: BlogPostSidebarHandle | null = $state(null)
	let postSwapActive = $state(false)

	let lastReaderScrollTop = 0
	let readerScrollIntent = 0
	let readerScrollPrimed = false
	let readerCollapsedTopbar = false
	let readerTopbarScrollLockUntil = 0
	let readerProgrammaticScroll = false
	let observedPostSlug = untrack(() => data.post.slug)
	let pendingPostHref: BlogPost['permalink'] | null = null
	let postNavigationRunning = false
	let postNavigationRequest = 0
	let activeReaderScroll: CancelableMotion | null = null
	let activeTextRows: CancelableMotion | null = null

	const readerScrollThreshold = 18
	const readerTopResetThreshold = 12
	const readerTopbarScrollLockMs = (() => {
		const topbarMotion = getMotionTokens({ portrait: false, reducedMotion }).topbar
		return topbarMotion.stageDurationMs + topbarMotion.stageCollapseDelayMs
	})()

	function isPlainPostActivation(event: MouseEvent) {
		return (
			event.button === 0 && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey
		)
	}

	function cancelActivePostMotion(restore = true) {
		activeReaderScroll?.cancel()
		activeReaderScroll = null
		activeTextRows?.cancel(restore)
		activeTextRows = null
		readerProgrammaticScroll = false
	}

	async function navigateToPendingPost() {
		if (postNavigationRunning || !pendingPostHref) {
			return
		}

		postNavigationRunning = true
		postSwapActive = true
		const request = ++postNavigationRequest

		try {
			while (pendingPostHref) {
				const initiallyRequestedHref = resolve(pendingPostHref)
				void preloadData(initiallyRequestedHref).catch(() => undefined)
				cancelActivePostMotion()
				activeTextRows = animatePostTextRows(
					readerStage,
					'out',
					blogMotion.postTextRowOutDurationMs,
					blogMotion.postTextRowStaggerRatio,
					motionTokens.shared.easingStandard
				)
				readerProgrammaticScroll = true
				activeReaderScroll = animateScrollTop(
					readerViewport,
					0,
					blogMotion.postReaderTopDurationMs,
					blogMotion.postScrollEasePower
				)

				await Promise.all([
					activeTextRows.finished,
					activeReaderScroll.finished,
					postSidebar?.beginSwapOut() ?? Promise.resolve(true)
				])

				if (request !== postNavigationRequest || !pendingPostHref) {
					break
				}

				const targetHref: BlogPost['permalink'] = pendingPostHref
				const resolvedTargetHref = resolve(targetHref)
				await preloadData(resolvedTargetHref).catch(() => undefined)
				if (request !== postNavigationRequest || targetHref !== pendingPostHref) {
					continue
				}

				await goto(resolvedTargetHref, {
					replaceState: true,
					noScroll: true,
					keepFocus: true
				})
				readerProgrammaticScroll = false
				activeReaderScroll = null

				if (pendingPostHref === targetHref) {
					pendingPostHref = null
				}
			}
		} catch {
			pendingPostHref = null
			cancelActivePostMotion()
			postSidebar?.cancelSwap()
			postListRail?.alignToSlug(data.post.slug, isLandscapeLayout && !reducedMotion)
		} finally {
			if (request === postNavigationRequest) {
				postNavigationRunning = false
				postSwapActive = false
			}
		}
	}

	function handlePostSelect(post: BlogPost, event: MouseEvent) {
		if (!isPlainPostActivation(event)) {
			return
		}

		event.preventDefault()
		if (post.slug === data.post.slug) {
			return
		}

		const targetHref = post.permalink
		postListRail?.alignToSlug(post.slug, isLandscapeLayout && !reducedMotion)
		if (!isLandscapeLayout || reducedMotion) {
			void goto(resolve(targetHref), {
				replaceState: true,
				noScroll: true,
				keepFocus: true
			})
			return
		}

		pendingPostHref = targetHref
		void navigateToPendingPost()
	}

	beforeNavigate((navigation) => {
		if (!postNavigationRunning || !pendingPostHref) {
			return
		}

		if (!navigation.willUnload && navigation.to?.url.pathname === resolve(pendingPostHref)) {
			return
		}

		postNavigationRequest += 1
		pendingPostHref = null
		postNavigationRunning = false
		postSwapActive = false
		cancelActivePostMotion()
		postSidebar?.cancelSwap()
	})

	function lockReaderTopbarScroll(scrollTop: number) {
		readerTopbarScrollLockUntil = performance.now() + readerTopbarScrollLockMs
		readerScrollIntent = 0
		lastReaderScrollTop = scrollTop
	}

	function expandReaderTopbar(scrollTop: number) {
		if (!navigationManager.topbarCollapsed) {
			return
		}

		navigationManager.toggleTopbarCollapsed(false)
		readerCollapsedTopbar = false
		lockReaderTopbarScroll(scrollTop)
	}

	function handleReaderScroll(event: CustomEvent<{ scrollTop: number; scrollLeft: number }>) {
		if (!isLandscapeLayout) {
			return
		}

		const nextScrollTop = event.detail.scrollTop
		if (readerProgrammaticScroll) {
			lastReaderScrollTop = nextScrollTop
			readerScrollIntent = 0
			return
		}
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
			const hasUpwardIntent = delta < -1
			readerScrollIntent = 0
			if (readerCollapsedTopbar || hasUpwardIntent) {
				expandReaderTopbar(nextScrollTop)
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
			expandReaderTopbar(nextScrollTop)
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
		if (deltaY >= -1) {
			return
		}

		if (performance.now() < readerTopbarScrollLockUntil) {
			return
		}

		if (scrollTop <= readerTopResetThreshold || !hasYOverflow) {
			expandReaderTopbar(scrollTop)
		}
	}

	$effect(() => {
		const nextSlug = data.post.slug
		if (nextSlug === observedPostSlug) {
			return
		}

		observedPostSlug = nextSlug
		void tick().then(() => {
			activeTextRows?.cancel()
			activeTextRows = null
			if (!isLandscapeLayout || reducedMotion) {
				return
			}

			const textRows = animatePostTextRows(
				readerStage,
				'in',
				blogMotion.postTextRowInDurationMs,
				blogMotion.postTextRowStaggerRatio,
				motionTokens.shared.easingStandard
			)
			activeTextRows = textRows
			void textRows.finished.then(() => {
				if (activeTextRows === textRows) {
					activeTextRows = null
				}
			})
		})
	})

	onDestroy(() => {
		postNavigationRequest += 1
		cancelActivePostMotion()
		postSidebar?.cancelSwap()
		if (readerCollapsedTopbar && navigationManager.topbarCollapsed) {
			navigationManager.toggleTopbarCollapsed(false)
		}
	})
</script>

<section
	class:post-shell-topbar-collapsed={isPostTopbarCollapsed}
	class:post-shell-switching={postSwapActive}
	class="post-shell"
>
	<div class="post-frame">
		<div class="post-layout">
			<div class="post-list-lane">
				<BlogPostListRail
					bind:this={postListRail}
					posts={data.allPosts}
					currentSlug={data.post.slug}
					{locale}
					listTitle={t('blog.post.listTitle')}
					uncategorizedLabel={t('common.uncategorized')}
					alignDurationMs={blogMotion.postListAlignDurationMs}
					scrollEasePower={blogMotion.postScrollEasePower}
					motionEnabled={isLandscapeLayout && !reducedMotion}
					onSelectPost={handlePostSelect}
				/>
			</div>

			<div class="post-reader-lane">
				<ScrollChrome
					class="post-reader-scroll"
					viewportClass="post-reader-viewport"
					bind:viewport={readerViewport}
					on:scroll={handleReaderScroll}
					on:wheelintent={handleReaderWheelIntent}
				>
					<div class="post-reader-transition-host">
						{#key postTransitionKey}
							<article bind:this={readerStage} class="post-reader-stage">
								<BlogPostBody post={data.post} {Content} />
							</article>
						{/key}
					</div>
				</ScrollChrome>
			</div>

			<div class="post-aside-lane">
				<BlogPostSidebar
					bind:this={postSidebar}
					post={data.post}
					seriesNavigation={data.seriesNavigation}
					transitionKey={postTransitionKey}
					{locale}
					metadataTitle={t('common.info')}
					categoryLabel={t('common.category')}
					descriptionLabel={t('blog.post.descriptionLabel')}
					publishedAtLabel={t('common.publishedAt').replace('{date}', '').trim()}
					updatedAtLabel={t('common.updatedAt').replace('{date}', '').trim()}
					seriesLabel={t('blog.post.seriesLabel')}
					newerLabel={t('blog.post.seriesNewer')}
					olderLabel={t('blog.post.seriesOlder')}
					uncategorizedLabel={t('common.uncategorized')}
					textOutDurationMs={blogMotion.postAsideTextOutDurationMs}
					textInDurationMs={blogMotion.postAsideTextInDurationMs}
					layoutDurationMs={blogMotion.postAsideLayoutDurationMs}
					tagCollapsedScaleX={blogMotion.postAsideTagCollapsedScaleX}
					{reducedMotion}
					motionEnabled={isLandscapeLayout && !reducedMotion}
					onSelectPost={handlePostSelect}
				/>
			</div>
		</div>
	</div>
</section>
