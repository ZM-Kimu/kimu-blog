<script lang="ts">
	import type { Component } from 'svelte'
	import { browser } from '$app/environment'
	import { page } from '$app/state'
	import { resolve } from '$app/paths'
	import { untrack } from 'svelte'

	import ScrollChrome from '$lib/components/ui/ScrollChrome.svelte'
	import { translate } from '$lib/i18n'
	import { getMotionTokens } from '$lib/motion/tokens'
	import type { BlogPost } from '$lib/types/content'
	import { formatDate } from '$lib/utils/date'

	import TagChip from './TagChip.svelte'

	type ArchiveSelectionSourceRect = {
		left: number
		top: number
		width: number
		height: number
	}

	type ArchiveReaderMorphParams = {
		key: string
		sourceRect: ArchiveSelectionSourceRect | null
		phase: ArchiveReaderPanelPhase
		onExitComplete: (key: string) => void
	}

	type ArchiveReaderPanelPhase = 'current' | 'outgoing'

	type ArchiveReaderPanel = {
		key: string
		post: BlogPost
		Content: Component<Record<string, never>>
		sourceRect: ArchiveSelectionSourceRect | null
		phase: ArchiveReaderPanelPhase
	}

	let {
		post,
		Content,
		selectionSourceRect = null
	}: {
		post: BlogPost | null
		Content: Component<Record<string, never>> | null
		selectionSourceRect?: ArchiveSelectionSourceRect | null
	} = $props()

	const messages = $derived(page.data.i18n?.messages)
	const locale = $derived(page.data.i18n?.locale)
	const t = (key: string, params?: Record<string, string | number>) =>
		translate(messages, key, params)
	const reducedMotion = browser
		? window.matchMedia('(prefers-reduced-motion: reduce)').matches
		: false
	const archiveMotion = getMotionTokens({ portrait: false, reducedMotion }).blog

	let tagsRail: HTMLDivElement | null = $state(null)
	let tagsOverflowing = $state(false)
	let tagsScrollableAhead = $state(false)
	let readerPanels = $state<ArchiveReaderPanel[]>([])
	let renderedPostKey = $state<string | null>(null)
	let readerPanelSequence = 0

	function clamp(value: number, min: number, max: number) {
		return Math.min(Math.max(value, min), max)
	}

	function animateArchiveReaderPanel(node: HTMLElement, params: ArchiveReaderMorphParams) {
		let lastKey = params.key
		let lastPhase = params.phase
		let timer: number | null = null
		let exiting = false

		function contentNode() {
			return node.querySelector<HTMLElement>('.archive-reader-panel-content')
		}

		function easeOutQuart(value: number) {
			const clamped = clamp(value, 0, 1)
			return 1 - (1 - clamped) ** 4
		}

		function easeOutQuint(value: number) {
			const clamped = clamp(value, 0, 1)
			return 1 - (1 - clamped) ** 5
		}

		function easeInCubic(value: number) {
			const clamped = clamp(value, 0, 1)
			return clamped ** 3
		}

		function clearTimer() {
			if (timer === null) {
				return
			}

			window.clearTimeout(timer)
			timer = null
		}

		function clearInlineStyles(content: HTMLElement | null) {
			node.style.opacity = ''
			node.style.transform = ''
			node.style.transformOrigin = ''
			node.style.filter = ''
			node.style.zIndex = ''
			node.style.pointerEvents = ''
			content?.style.removeProperty('opacity')
			content?.style.removeProperty('transform')
			content?.style.removeProperty('filter')
		}

		function runExit(nextParams: ArchiveReaderMorphParams) {
			if (exiting) {
				return
			}

			exiting = true
			clearTimer()

			const startedAt = performance.now()
			const duration = Math.max(1, archiveMotion.archiveReaderPanelExitDurationMs)
			const startOpacity = Number.parseFloat(getComputedStyle(node).opacity) || 1

			function step() {
				const rawProgress =
					duration <= 1 ? 1 : clamp((performance.now() - startedAt) / duration, 0, 1)
				const progress = easeInCubic(rawProgress)
				const rest = 1 - progress

				node.style.opacity = String(startOpacity * rest)
				node.style.transformOrigin = 'center'
				node.style.transform = `translate3d(${archiveMotion.archiveReaderExitOffsetXPx * progress}px, ${archiveMotion.archiveReaderExitOffsetYPx * progress}px, 0) scale(${1 - progress * 0.018})`
				node.style.filter = `blur(${archiveMotion.archiveReaderExitBlurPx * progress}px)`
				node.style.zIndex = '1'
				node.style.pointerEvents = 'none'

				if (rawProgress >= 1) {
					timer = null
					nextParams.onExitComplete(nextParams.key)
					return
				}

				timer = window.setTimeout(step, 12)
			}

			step()
		}

		function run(nextParams: ArchiveReaderMorphParams) {
			clearTimer()
			exiting = false
			const content = contentNode()
			const targetRect = node.getBoundingClientRect()
			const sourceRect = nextParams.sourceRect
			let deltaX = archiveMotion.archiveReaderFallbackOffsetXPx
			let deltaY = archiveMotion.archiveReaderFallbackOffsetYPx
			let scaleX = 1
			let scaleY = 1

			if (sourceRect && targetRect.width > 0 && targetRect.height > 0) {
				deltaX = sourceRect.left - targetRect.left
				deltaY = sourceRect.top - targetRect.top
				scaleX = clamp(sourceRect.width / targetRect.width, 0.08, 1.12)
				scaleY = clamp(sourceRect.height / targetRect.height, 0.04, 1.12)
			}

			const startedAt = performance.now()
			const duration = Math.max(1, archiveMotion.archiveReaderMorphDurationMs)

			function step() {
				const rawProgress =
					duration <= 1 ? 1 : clamp((performance.now() - startedAt) / duration, 0, 1)
				const panelProgress = easeOutQuint(rawProgress)
				const panelRest = 1 - panelProgress
				const nextScaleX = scaleX + (1 - scaleX) * panelProgress
				const nextScaleY = scaleY + (1 - scaleY) * panelProgress
				const contentRawProgress = clamp(
					(rawProgress - archiveMotion.archiveReaderContentRevealStart) /
						(1 - archiveMotion.archiveReaderContentRevealStart),
					0,
					1
				)
				const contentProgress = easeOutQuart(contentRawProgress)

				node.style.opacity = String(clamp(panelProgress * 1.18, 0, 1))
				node.style.transformOrigin = 'top left'
				node.style.transform = `translate3d(${deltaX * panelRest}px, ${deltaY * panelRest}px, 0) scale(${nextScaleX}, ${nextScaleY})`
				node.style.filter = `blur(${archiveMotion.archiveReaderMorphBlurPx * panelRest}px)`
				node.style.zIndex = '2'

				if (content) {
					const contentRest = 1 - contentProgress
					content.style.opacity = String(contentProgress)
					content.style.transform = `translateY(${archiveMotion.archiveReaderContentOffsetYPx * contentRest}px)`
					content.style.filter = `blur(${archiveMotion.archiveReaderContentBlurPx * contentRest}px)`
				}

				if (rawProgress >= 1) {
					timer = null
					clearInlineStyles(content)
					return
				}

				timer = window.setTimeout(step, 12)
			}

			step()
		}

		if (params.phase === 'outgoing') {
			runExit(params)
		} else {
			run(params)
		}

		return {
			update(nextParams: ArchiveReaderMorphParams) {
				if (nextParams.phase === 'outgoing') {
					lastKey = nextParams.key
					lastPhase = nextParams.phase
					runExit(nextParams)
					return
				}

				if (nextParams.key === lastKey && nextParams.phase === lastPhase) {
					return
				}

				lastKey = nextParams.key
				lastPhase = nextParams.phase
				run(nextParams)
			},
			destroy() {
				clearTimer()
				clearInlineStyles(contentNode())
			}
		}
	}

	function removeReaderPanel(key: string) {
		readerPanels = readerPanels.filter((panel) => panel.key !== key)
	}

	$effect(() => {
		const nextPostKey = post && Content ? post.slug : null

		if (nextPostKey === renderedPostKey) {
			if (nextPostKey && post && Content) {
				readerPanels = untrack(() =>
					readerPanels.map((panel) =>
						panel.phase === 'current' && panel.post.slug === nextPostKey
							? { ...panel, post, Content }
							: panel
					)
				)
			}
			return
		}

		const outgoingPanels = untrack(() =>
			readerPanels.map((panel) =>
				panel.phase === 'current' ? { ...panel, phase: 'outgoing' as const } : panel
			)
		)
		const nextPanel =
			post && Content
				? {
						key: `${post.slug}:${++readerPanelSequence}`,
						post,
						Content,
						sourceRect: selectionSourceRect,
						phase: 'current' as const
					}
				: null

		readerPanels = nextPanel ? [...outgoingPanels, nextPanel] : outgoingPanels
		renderedPostKey = nextPostKey
	})

	function updateTagsRailState() {
		if (!tagsRail) {
			tagsOverflowing = false
			tagsScrollableAhead = false
			return
		}

		const overflowAmount = tagsRail.scrollWidth - tagsRail.clientWidth
		tagsOverflowing = overflowAmount > 4
		tagsScrollableAhead =
			tagsOverflowing && tagsRail.scrollLeft + tagsRail.clientWidth < tagsRail.scrollWidth - 4
	}

	function advanceTagsRail() {
		if (!tagsRail || !tagsOverflowing) {
			return
		}

		tagsRail.scrollBy({
			left: Math.max(tagsRail.clientWidth * 0.45, 48),
			behavior: 'smooth'
		})
	}

	$effect(() => {
		if (!post || !tagsRail) {
			updateTagsRailState()
			return
		}

		const frame = window.requestAnimationFrame(() => {
			updateTagsRailState()
		})
		const handleScroll = () => {
			updateTagsRailState()
		}
		const handleWheel = (event: WheelEvent) => {
			if (!tagsRail || !tagsOverflowing) {
				return
			}

			const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX
			if (delta === 0) {
				return
			}

			event.preventDefault()
			tagsRail.scrollLeft += delta
		}
		const resizeObserver = new ResizeObserver(() => {
			updateTagsRailState()
		})

		tagsRail.addEventListener('scroll', handleScroll, { passive: true })
		tagsRail.addEventListener('wheel', handleWheel, { passive: false })
		resizeObserver.observe(tagsRail)

		return () => {
			window.cancelAnimationFrame(frame)
			tagsRail?.removeEventListener('scroll', handleScroll)
			tagsRail?.removeEventListener('wheel', handleWheel)
			resizeObserver.disconnect()
		}
	})
</script>

<aside class="archive-reader-rail">
	{#each readerPanels as panel (panel.key)}
		{@const PanelContent = panel.Content}
		<section
			class:archive-reader-panel-current={panel.phase === 'current'}
			class:archive-reader-panel-outgoing={panel.phase === 'outgoing'}
			class="panel archive-reader-panel"
			use:animateArchiveReaderPanel={{
				key: panel.key,
				sourceRect: panel.sourceRect,
				phase: panel.phase,
				onExitComplete: removeReaderPanel
			}}
		>
			<div class="archive-reader-panel-content">
				<ScrollChrome class="archive-reader-scroll" viewportClass="archive-reader-browser">
					<div class="archive-reader-head">
						<div class="archive-reader-head-bar">
							<div class="archive-reader-title-line">
								<div class="archive-reader-title-bar">
									<h2>{panel.post.title}</h2>
									<p class="eyebrow">{panel.post.category ?? t('common.uncategorized')}</p>
									<p class="archive-reader-date">{formatDate(panel.post.date, locale)}</p>
								</div>
								{#if panel.post.tags.length}
									<div class="archive-reader-tags-wrap">
										<div
											class="archive-reader-tags"
											data-overflowing={tagsOverflowing}
											bind:this={tagsRail}
										>
											<div class="archive-reader-tags-list">
												{#each panel.post.tags as tag, index (panel.post.tagSlugs[index])}
													<TagChip href={`/tags/${panel.post.tagSlugs[index]}`} label={tag} />
												{/each}
											</div>
										</div>
										{#if tagsOverflowing && tagsScrollableAhead}
											<button
												type="button"
												class="archive-reader-tags-hint"
												aria-label={t('blog.archive.tagsScrollHint')}
												onclick={advanceTagsRail}
											>
												...
											</button>
										{/if}
									</div>
								{:else}
									<p class="archive-reader-no-tags">{t('common.noTagsYet')}</p>
								{/if}
							</div>
						</div>
						<p>{panel.post.description}</p>
					</div>

					<dl class="archive-reader-meta">
						{#if panel.post.updated !== panel.post.date}
							<div>
								<dt>{t('common.updated')}</dt>
								<dd>{formatDate(panel.post.updated, locale)}</dd>
							</div>
						{/if}
						{#if panel.post.readingTime}
							<div>
								<dt>{t('blog.post.metadataTitle')}</dt>
								<dd>{panel.post.readingTime}</dd>
							</div>
						{/if}
					</dl>

					<div class="content-prose article-prose archive-reader-prose">
						<PanelContent />
					</div>
				</ScrollChrome>

				<a
					class="archive-reader-open-link"
					href={resolve(panel.post.permalink)}
					aria-label={t('blog.archive.openPost')}
				>
					<span class="archive-reader-open-icon" aria-hidden="true"></span>
					<span class="archive-reader-open-copy">{t('blog.archive.openPost')}</span>
				</a>
			</div>
		</section>
	{/each}
</aside>
