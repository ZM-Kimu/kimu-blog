<script lang="ts">
	import { browser } from '$app/environment'
	import ScrollChrome from '$lib/components/ui/ScrollChrome.svelte'
	import type { AppLocale } from '$lib/i18n/config'
	import { getMotionTokens } from '$lib/motion/tokens'
	import type { BlogPost } from '$lib/types/content'
	import type { BlogCategory } from '$lib/content/blog-categories'
	import { formatDate } from '$lib/utils/date'

	type ArchiveCategoryOption = {
		slug: string
		title: string
		count: number
	}

	type ArchiveSelectionSourceRect = {
		left: number
		top: number
		width: number
		height: number
	}

	let {
		totalPosts,
		categoryOptions,
		requestedCategory,
		filteredPosts,
		selectedSlug,
		locale,
		allLabel,
		sectionLabel,
		getCategoryLabel,
		emptyLabel,
		onSelectCategory,
		onSelectPost
	}: {
		totalPosts: number
		categoryOptions: ArchiveCategoryOption[]
		requestedCategory: string | null
		filteredPosts: BlogPost[]
		selectedSlug: string | null
		locale?: AppLocale
		allLabel: string
		sectionLabel: string
		getCategoryLabel: (category: BlogCategory) => string
		emptyLabel: string
		onSelectCategory: (slug: string | null) => void
		onSelectPost: (slug: string, sourceRect: ArchiveSelectionSourceRect | null) => void
	} = $props()

	const reducedMotion = browser
		? window.matchMedia('(prefers-reduced-motion: reduce)').matches
		: false
	const archiveMotion = getMotionTokens({ portrait: false, reducedMotion }).blog

	function readSourceRect(element: EventTarget | null): ArchiveSelectionSourceRect | null {
		if (!(element instanceof HTMLElement)) {
			return null
		}

		const rect = element.getBoundingClientRect()
		return {
			left: rect.left,
			top: rect.top,
			width: rect.width,
			height: rect.height
		}
	}

	function handleSelectPost(event: MouseEvent, slug: string) {
		onSelectPost(slug, readSourceRect(event.currentTarget))
	}

	function animateEntryListShape(node: HTMLElement) {
		if (!browser) {
			return
		}

		let previousHeight = 0
		let frame = 0
		let animation: Animation | null = null
		let activeTargetHeight = 0

		function readPx(value: string) {
			const parsed = Number.parseFloat(value)
			return Number.isFinite(parsed) ? parsed : 0
		}

		function readTargetHeight() {
			const toolbar = node.querySelector<HTMLElement>('.archive-entry-toolbar')
			const scroll = node.querySelector<HTMLElement>('.archive-entry-scroll')
			const stack = node.querySelector<HTMLElement>('.archive-entry-stack')
			const optionList = node.querySelector<HTMLElement>('.archive-entry-option-list')
			const nodeStyles = getComputedStyle(node)
			const scrollStyles = scroll ? getComputedStyle(scroll) : null
			const stackStyles = stack ? getComputedStyle(stack) : null
			const optionListStyles = optionList ? getComputedStyle(optionList) : null
			const maxHeight = readPx(nodeStyles.maxHeight)
			const borderHeight = readPx(nodeStyles.borderTopWidth) + readPx(nodeStyles.borderBottomWidth)
			const toolbarHeight = toolbar?.getBoundingClientRect().height ?? 0
			const scrollMarginHeight = scrollStyles
				? readPx(scrollStyles.marginTop) + readPx(scrollStyles.marginBottom)
				: 0
			const stackPaddingHeight = stackStyles
				? readPx(stackStyles.paddingTop) + readPx(stackStyles.paddingBottom)
				: 0
			const optionListGap = optionListStyles
				? readPx(optionListStyles.rowGap || optionListStyles.gap)
				: 0
			const optionListChildren = optionList
				? Array.from(optionList.children).filter(
						(child): child is HTMLElement => child instanceof HTMLElement
					)
				: []
			const optionListHeight =
				optionListChildren.reduce((sum, child) => {
					return sum + child.getBoundingClientRect().height
				}, 0) +
				Math.max(optionListChildren.length - 1, 0) * optionListGap
			const contentHeight =
				toolbarHeight + scrollMarginHeight + optionListHeight + stackPaddingHeight + borderHeight

			return maxHeight > 0 ? Math.min(contentHeight, maxHeight) : contentHeight
		}

		function clearFrame() {
			if (!frame) {
				return
			}

			window.cancelAnimationFrame(frame)
			frame = 0
		}

		function scheduleShapeUpdate() {
			clearFrame()
			frame = window.requestAnimationFrame(() => {
				frame = 0
				const nextHeight = readTargetHeight()
				const fromHeight = node.getBoundingClientRect().height || previousHeight
				if (animation && Math.abs(nextHeight - activeTargetHeight) < 1) {
					return
				}

				if (Math.abs(nextHeight - fromHeight) < 1) {
					previousHeight = nextHeight
					return
				}

				animation?.cancel()
				node.style.height = `${fromHeight}px`
				node.style.overflow = 'hidden'
				const activeAnimation = node.animate(
					[{ height: `${fromHeight}px` }, { height: `${nextHeight}px` }],
					{
						duration: archiveMotion.archiveEntryShapeDurationMs,
						easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
						fill: 'forwards'
					}
				)
				animation = activeAnimation
				activeTargetHeight = nextHeight
				activeAnimation.onfinish = () => {
					if (animation !== activeAnimation) {
						return
					}

					animation = null
					node.style.height = `${nextHeight}px`
					node.style.overflow = ''
					previousHeight = readTargetHeight()
				}
				activeAnimation.oncancel = () => {
					if (animation !== activeAnimation) {
						return
					}

					animation = null
				}
			})
		}

		const mutationObserver = new MutationObserver(scheduleShapeUpdate)
		const handleResize = () => {
			scheduleShapeUpdate()
		}

		previousHeight = readTargetHeight()
		node.style.height = `${previousHeight}px`
		mutationObserver.observe(node, {
			childList: true,
			subtree: true,
			characterData: true
		})
		node.addEventListener('load', scheduleShapeUpdate, true)
		window.addEventListener('resize', handleResize)

		return {
			destroy() {
				clearFrame()
				animation?.cancel()
				mutationObserver.disconnect()
				node.removeEventListener('load', scheduleShapeUpdate, true)
				window.removeEventListener('resize', handleResize)
				node.style.height = ''
				node.style.overflow = ''
			}
		}
	}
</script>

<div class="archive-entry-column">
	<section class="panel archive-entry-list" aria-label={sectionLabel} use:animateEntryListShape>
		<div class="archive-entry-toolbar">
			<div class="archive-entry-filter-nav" aria-label={sectionLabel}>
				<button
					type="button"
					class:archive-entry-filter-button-selected={!requestedCategory}
					class="archive-entry-filter-button"
					onclick={() => onSelectCategory(null)}
				>
					<span>{allLabel}</span>
					<small class="archive-entry-filter-count">{totalPosts}</small>
				</button>

				{#each categoryOptions as option (option.slug)}
					<button
						type="button"
						class:archive-entry-filter-button-selected={requestedCategory === option.slug}
						class="archive-entry-filter-button"
						onclick={() => onSelectCategory(option.slug)}
					>
						<span>{option.title}</span>
						<small class="archive-entry-filter-count">{option.count}</small>
					</button>
				{/each}
			</div>
		</div>

		<ScrollChrome class="archive-entry-scroll" viewportClass="archive-entry-stack">
			<div class="archive-entry-option-list" role="listbox" aria-label={sectionLabel}>
				{#if filteredPosts.length}
					{#each filteredPosts as post (post.slug)}
						<button
							type="button"
							role="option"
							class:archive-entry-item-selected={selectedSlug === post.slug}
							class="archive-entry-item"
							aria-selected={selectedSlug === post.slug}
							onclick={(event) => handleSelectPost(event, post.slug)}
						>
							<div class="archive-entry-item-copy">
								<p class="archive-entry-date">{formatDate(post.date, locale)}</p>
								<h2>{post.title}</h2>
								<p>{post.description}</p>
							</div>
							<img
								alt=""
								aria-hidden="true"
								class="archive-entry-item-cover"
								decoding="async"
								draggable="false"
								loading="lazy"
								src={post.cover}
							/>
							<div class="archive-entry-item-meta">
								<span>{getCategoryLabel(post.category)}</span>
								<div class="archive-entry-tag-row">
									{#each post.tags.slice(0, 2) as tag, index (post.tagSlugs[index] ?? tag)}
										<span class="tag-chip archive-entry-tag">{tag}</span>
									{/each}
								</div>
							</div>
						</button>
					{/each}
				{:else}
					<div class="archive-entry-empty">
						<img
							class="archive-entry-empty-image"
							src="/Image_Mail_Empty.png"
							alt=""
							aria-hidden="true"
							loading="lazy"
							decoding="async"
							draggable="false"
						/>
						<p>{emptyLabel}</p>
					</div>
				{/if}
			</div>
		</ScrollChrome>
	</section>
</div>
