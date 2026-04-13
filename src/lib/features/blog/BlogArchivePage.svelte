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
	import { resolve } from '$app/paths'
	import { browser } from '$app/environment'
	import { afterNavigate, replaceState } from '$app/navigation'
	import { page } from '$app/state'
	import { missionCatalog } from '$lib/features/blog/config'
	import ScrollChrome from '$lib/components/ui/ScrollChrome.svelte'
	import { translate } from '$lib/i18n'
	import type { CategorySummary, BlogPost } from '$lib/types/content'
	import TagChip from './components/TagChip.svelte'
	import { formatDate } from '$lib/utils/date'
	import { onMount } from 'svelte'

	let {
		data
	}: {
		data: {
			posts: BlogPost[]
			categories: CategorySummary[]
			totalPosts: number
		}
	} = $props()

	const messages = $derived(page.data.i18n?.messages)
	const locale = $derived(page.data.i18n?.locale)
	const t = (key: string, params?: Record<string, string | number>) =>
		translate(messages, key, params)

	let requestedCategory = $state<string | null>(null)
	const activeMission = $derived.by(() =>
		requestedCategory
			? (missionCatalog.find((entry) => entry.slug === requestedCategory) ?? null)
			: null
	)
	const filteredPosts = $derived.by(() =>
		activeMission
			? data.posts.filter(
					(post) =>
						(post.categorySlug && activeMission.matches.includes(post.categorySlug)) ||
						(post.category && activeMission.matches.includes(post.category))
				)
			: data.posts
	)
	const archiveFilterMissions = missionCatalog.filter((entry) => entry.href !== '/favorites')
	const categoryOptions = $derived.by(() =>
		archiveFilterMissions.map((mission) => ({
			slug: mission.slug,
			title: t(`home.missions.${mission.id}.title`),
			count: data.categories.find((entry) => mission.matches.includes(entry.slug))?.count ?? 0
		}))
	)

	let selectedSlug = $state<string | null>(null)
	let tagsRail: HTMLDivElement | null = $state(null)
	let tagsOverflowing = $state(false)
	let tagsScrollableAhead = $state(false)

	const selectedPost = $derived.by(
		() => filteredPosts.find((post) => post.slug === selectedSlug) ?? null
	)
	const Content = $derived.by(() => {
		if (!selectedPost) {
			return null
		}

		return modules[selectedPost.path]?.default ?? null
	})

	function buildArchiveHref(
		nextCategory: string | null = requestedCategory,
		nextPost: string | null = selectedSlug
	) {
		const params = new URLSearchParams(
			[
				nextCategory ? ['category', nextCategory] : null,
				nextPost ? ['post', nextPost] : null
			].filter((entry): entry is [string, string] => entry !== null)
		)
		const query = params.toString()
		return query ? `${resolve('/blog/archive')}?${query}` : resolve('/blog/archive')
	}

	$effect(() => {
		if (selectedSlug && !filteredPosts.some((post) => post.slug === selectedSlug)) {
			if (browser) {
				// eslint-disable-next-line svelte/no-navigation-without-resolve
				replaceState(buildArchiveHref(requestedCategory, null), page.state)
			}

			selectedSlug = null
		}
	})

	function selectPost(slug: string) {
		if (browser) {
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			replaceState(buildArchiveHref(requestedCategory, slug), page.state)
		}

		selectedSlug = slug
	}

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

	function selectCategory(slug: string | null) {
		if (!browser) {
			requestedCategory = slug
			selectedSlug = null
			return
		}

		// eslint-disable-next-line svelte/no-navigation-without-resolve
		replaceState(buildArchiveHref(slug, null), page.state)
		requestedCategory = slug
		selectedSlug = null
	}

	function syncRequestedCategory() {
		if (!browser) {
			requestedCategory = null
			selectedSlug = null
			return
		}

		const url = new URL(window.location.href)
		requestedCategory = url.searchParams.get('category')
		selectedSlug = url.searchParams.get('post')
	}

	onMount(() => {
		syncRequestedCategory()

		const handlePopState = () => {
			syncRequestedCategory()
		}

		window.addEventListener('popstate', handlePopState)

		return () => {
			window.removeEventListener('popstate', handlePopState)
		}
	})

	afterNavigate(() => {
		syncRequestedCategory()
	})

	$effect(() => {
		const activePost = selectedPost

		if (!browser || !activePost || !tagsRail) {
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

<section class="archive-screen archive-screen-rebuilt">
	<section class="archive-layout archive-layout-rebuilt">
		<div class="archive-entry-column">
			<section class="panel archive-entry-list" aria-label={t('blog.archive.introTitle')}>
				<ScrollChrome class="archive-entry-scroll" viewportClass="archive-entry-stack">
					<div class="archive-entry-toolbar">
						<div class="archive-entry-filter-nav" aria-label={t('common.category')}>
							<button
								type="button"
								class:archive-entry-filter-button-selected={!requestedCategory}
								class="archive-entry-filter-button"
								onclick={() => selectCategory(null)}
							>
								<span>{t('common.all')}</span>
								<small class="archive-entry-filter-count">{data.totalPosts}</small>
							</button>

							{#each categoryOptions as option (option.slug)}
								<button
									type="button"
									class:archive-entry-filter-button-selected={requestedCategory === option.slug}
									class="archive-entry-filter-button"
									onclick={() => selectCategory(option.slug)}
								>
									<span>{option.title}</span>
									<small class="archive-entry-filter-count">{option.count}</small>
								</button>
							{/each}
						</div>
					</div>

					<div
						class="archive-entry-option-list"
						role="listbox"
						aria-label={t('blog.archive.introTitle')}
					>
						{#if filteredPosts.length}
							{#each filteredPosts as post (post.slug)}
								<button
									type="button"
									role="option"
									class:archive-entry-item-selected={selectedSlug === post.slug}
									class="archive-entry-item"
									aria-selected={selectedSlug === post.slug}
									onclick={() => selectPost(post.slug)}
								>
									<div class="archive-entry-item-copy">
										<p class="archive-entry-date">{formatDate(post.date, locale)}</p>
										<h2>{post.title}</h2>
										<p>{post.description}</p>
									</div>
									<div class="archive-entry-item-meta">
										<span>{post.category ?? t('common.uncategorized')}</span>
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
								<p class="archive-entry-date">{t('blog.archive.emptyDate')}</p>
							</div>
						{/if}
					</div>
				</ScrollChrome>
			</section>
		</div>

		<aside class="archive-preview-rail">
			{#if selectedPost && Content}
				<a
					class="archive-preview-open-link"
					href={resolve(selectedPost.permalink)}
					aria-label={t('blog.archive.openPost')}
				>
					<span class="archive-preview-open-icon" aria-hidden="true"></span>
				</a>

				<section class="panel archive-preview-panel">
					<ScrollChrome class="archive-preview-scroll" viewportClass="archive-preview-browser">
						<div class="archive-preview-head">
							<div class="archive-preview-head-bar">
								<div class="archive-preview-title-line">
									<div class="archive-preview-title-bar">
										<h2>{selectedPost.title}</h2>
										<p class="eyebrow">{selectedPost.category ?? t('common.uncategorized')}</p>
										<p class="archive-preview-date">{formatDate(selectedPost.date, locale)}</p>
									</div>
									{#if selectedPost.tags.length}
										<div class="archive-preview-tags-wrap">
											<div
												class="archive-preview-tags"
												data-overflowing={tagsOverflowing}
												bind:this={tagsRail}
											>
												<div class="archive-preview-tags-list">
													{#each selectedPost.tags as tag, index (selectedPost.tagSlugs[index])}
														<TagChip href={`/tags/${selectedPost.tagSlugs[index]}`} label={tag} />
													{/each}
												</div>
											</div>
											{#if tagsOverflowing && tagsScrollableAhead}
												<button
													type="button"
													class="archive-preview-tags-hint"
													aria-label={t('blog.archive.tagsScrollHint')}
													onclick={advanceTagsRail}
												>
													...
												</button>
											{/if}
										</div>
									{:else}
										<p class="archive-preview-no-tags">{t('common.noTagsYet')}</p>
									{/if}
								</div>
							</div>
							<p>{selectedPost.description}</p>
						</div>

						<dl class="archive-preview-meta">
							{#if selectedPost.updated !== selectedPost.date}
								<div>
									<dt>{t('common.updated')}</dt>
									<dd>{formatDate(selectedPost.updated, locale)}</dd>
								</div>
							{/if}
							{#if selectedPost.readingTime}
								<div>
									<dt>{t('blog.post.metadataTitle')}</dt>
									<dd>{selectedPost.readingTime}</dd>
								</div>
							{/if}
						</dl>

						<div class="content-prose article-prose archive-preview-prose">
							<Content />
						</div>
					</ScrollChrome>
				</section>
			{/if}
		</aside>
	</section>
</section>
