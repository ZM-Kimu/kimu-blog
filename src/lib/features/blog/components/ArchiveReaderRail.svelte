<script lang="ts">
	import type { Component } from 'svelte'
	import { page } from '$app/state'
	import { resolve } from '$app/paths'

	import ScrollChrome from '$lib/components/ui/ScrollChrome.svelte'
	import { translate } from '$lib/i18n'
	import type { BlogPost } from '$lib/types/content'
	import { formatDate } from '$lib/utils/date'

	import TagChip from './TagChip.svelte'

	let {
		post,
		Content
	}: {
		post: BlogPost | null
		Content: Component<Record<string, never>> | null
	} = $props()

	const messages = $derived(page.data.i18n?.messages)
	const locale = $derived(page.data.i18n?.locale)
	const t = (key: string, params?: Record<string, string | number>) =>
		translate(messages, key, params)

	let tagsRail: HTMLDivElement | null = $state(null)
	let tagsOverflowing = $state(false)
	let tagsScrollableAhead = $state(false)

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
	{#if post && Content}
		<a
			class="archive-reader-open-link"
			href={resolve(post.permalink)}
			aria-label={t('blog.archive.openPost')}
		>
			<span class="archive-reader-open-icon" aria-hidden="true"></span>
		</a>

		<section class="panel archive-reader-panel">
			<ScrollChrome class="archive-reader-scroll" viewportClass="archive-reader-browser">
				<div class="archive-reader-head">
					<div class="archive-reader-head-bar">
						<div class="archive-reader-title-line">
							<div class="archive-reader-title-bar">
								<h2>{post.title}</h2>
								<p class="eyebrow">{post.category ?? t('common.uncategorized')}</p>
								<p class="archive-reader-date">{formatDate(post.date, locale)}</p>
							</div>
							{#if post.tags.length}
								<div class="archive-reader-tags-wrap">
									<div
										class="archive-reader-tags"
										data-overflowing={tagsOverflowing}
										bind:this={tagsRail}
									>
										<div class="archive-reader-tags-list">
											{#each post.tags as tag, index (post.tagSlugs[index])}
												<TagChip href={`/tags/${post.tagSlugs[index]}`} label={tag} />
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
					<p>{post.description}</p>
				</div>

				<dl class="archive-reader-meta">
					{#if post.updated !== post.date}
						<div>
							<dt>{t('common.updated')}</dt>
							<dd>{formatDate(post.updated, locale)}</dd>
						</div>
					{/if}
					{#if post.readingTime}
						<div>
							<dt>{t('blog.post.metadataTitle')}</dt>
							<dd>{post.readingTime}</dd>
						</div>
					{/if}
				</dl>

				<div class="content-prose article-prose archive-reader-prose">
					<Content />
				</div>
			</ScrollChrome>
		</section>
	{/if}
</aside>
