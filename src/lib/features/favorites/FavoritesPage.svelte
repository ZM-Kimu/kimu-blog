<script lang="ts">
	import { resolve } from '$app/paths'
	import { page } from '$app/state'
	import ScrollChrome from '$lib/components/ui/ScrollChrome.svelte'
	import { translate } from '$lib/i18n'
	import { untrack } from 'svelte'
	import type { FavoriteEntry, FavoritesPageData } from '$lib/types/info-flow'

	type FavoriteContentPanel = {
		key: string
		tag: string
		entries: FavoriteEntry[]
		phase: 'current' | 'outgoing'
		entryMode: 'initial' | 'switch'
	}

	let { data }: { data: FavoritesPageData } = $props()
	const messages = $derived(page.data.i18n?.messages)
	const t = (key: string, params?: Record<string, string | number>) =>
		translate(messages, key, params)

	let activeTag = $state('all')
	let contentPanelSequence = 0
	let renderedTag = $state<string | null>(null)
	let contentPanels = $state<FavoriteContentPanel[]>([])

	const visibleEntries = $derived.by(() => data.entries.filter((entry) => matchesActiveTag(entry)))
	const renderedContentPanels = $derived.by(() =>
		contentPanels.length
			? contentPanels
			: [
					{
						key: `${activeTag}:0`,
						tag: activeTag,
						entries: visibleEntries,
						phase: 'current' as const,
						entryMode: 'initial' as const
					}
				]
	)

	$effect(() => {
		const nextTag = activeTag
		const nextEntries = visibleEntries

		if (renderedTag === null) {
			renderedTag = nextTag
			contentPanels = [
				{
					key: `${nextTag}:${contentPanelSequence}`,
					tag: nextTag,
					entries: nextEntries,
					phase: 'current',
					entryMode: 'initial'
				}
			]
			return
		}

		if (nextTag === renderedTag) {
			contentPanels = untrack(() =>
				contentPanels.map((panel) =>
					panel.phase === 'current' ? { ...panel, entries: nextEntries } : panel
				)
			)
			return
		}

		const outgoingPanels = untrack(() =>
			contentPanels.map((panel) =>
				panel.phase === 'current' ? { ...panel, phase: 'outgoing' as const } : panel
			)
		)

		contentPanels = [
			...outgoingPanels,
			{
				key: `${nextTag}:${++contentPanelSequence}`,
				tag: nextTag,
				entries: nextEntries,
				phase: 'current',
				entryMode: 'switch'
			}
		]
		renderedTag = nextTag
	})

	function matchesActiveTag(entry: FavoriteEntry) {
		return (
			activeTag === 'all' ||
			entry.tags.some((tag) => tag.toLocaleLowerCase() === activeTag.toLocaleLowerCase())
		)
	}

	function isExternalHref(
		href: FavoriteEntry['href']
	): href is `http://${string}` | `https://${string}` {
		return /^https?:\/\//.test(href)
	}

	function removeContentPanel(key: string) {
		contentPanels = contentPanels.filter((panel) => panel.key !== key)
	}

	function handleContentAnimationEnd(event: AnimationEvent, panel: FavoriteContentPanel) {
		if (panel.phase !== 'outgoing') {
			return
		}

		const target = event.target
		if (!(target instanceof HTMLElement) || !target.classList.contains('favorites-content-panel')) {
			return
		}

		removeContentPanel(panel.key)
	}
</script>

{#snippet favoriteCardContent(item: FavoriteEntry)}
	<div class="info-flow-card-hud">
		{#each item.tags as tag (tag)}<span>{tag}</span>{/each}
		<span>{item.sourceLabel}</span>
	</div>
	<h3>{item.title}</h3>
	<p>{item.description}</p>
{/snippet}

<section class="info-flow-screen favorites-screen">
	<section class="panel favorites-flow-panel" aria-label={t('favorites.collectionsAria')}>
		<header class="favorites-flow-head">
			<div class="info-flow-filter-row" aria-label={t('favorites.filtersLabel')}>
				<button
					class:info-flow-filter-active={activeTag === 'all'}
					type="button"
					aria-pressed={activeTag === 'all'}
					onclick={() => {
						activeTag = 'all'
					}}
				>
					{t('common.all')}
				</button>
				{#each data.tags as tag (tag)}
					<button
						class:info-flow-filter-active={activeTag === tag}
						type="button"
						aria-pressed={activeTag === tag}
						onclick={() => {
							activeTag = tag
						}}
					>
						{tag}
					</button>
				{/each}
			</div>
		</header>

		<div class="info-flow-stage favorites-stage">
			<ScrollChrome class="info-flow-scroll" viewportClass="info-flow-viewport">
				<div class="favorites-content-stack">
					{#each renderedContentPanels as panel (panel.key)}
						<div
							class:favorites-content-panel-current={panel.phase === 'current'}
							class:favorites-content-panel-outgoing={panel.phase === 'outgoing'}
							class:favorites-content-panel-switch={panel.entryMode === 'switch'}
							class="favorites-content-panel"
							aria-hidden={panel.phase === 'outgoing'}
							inert={panel.phase === 'outgoing'}
							onanimationend={(event) => handleContentAnimationEnd(event, panel)}
						>
							{#if panel.entries.length}
								<div class="favorites-flow">
									<div class="favorites-collections">
										{#each panel.entries as item (item.id)}
											{#if isExternalHref(item.href)}
												<a
													class="favorite-card"
													href={item.href}
													target="_blank"
													rel="external noreferrer"
													aria-label={t('favorites.openItem', { title: item.title })}
												>
													{@render favoriteCardContent(item)}
												</a>
											{:else}
												<a
													class="favorite-card"
													href={resolve(item.href as `/${string}`)}
													aria-label={t('favorites.openItem', { title: item.title })}
												>
													{@render favoriteCardContent(item)}
												</a>
											{/if}
										{/each}
									</div>
								</div>
							{:else}
								<div class="info-flow-empty">
									<p>{t('favorites.emptyDescription')}</p>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</ScrollChrome>
		</div>
	</section>
</section>
