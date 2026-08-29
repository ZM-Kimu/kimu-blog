<script lang="ts">
	import { resolve } from '$app/paths'
	import { page } from '$app/state'
	import ScrollChrome from '$lib/components/ui/ScrollChrome.svelte'
	import { translate } from '$lib/i18n'
	import { untrack } from 'svelte'
	import type { FavoriteEntry, FavoriteKind, FavoritesPageData } from '$lib/types/info-flow'

	type FavoriteContentPanel = {
		key: string
		collection: string
		entries: FavoriteEntry[]
		phase: 'current' | 'outgoing'
		entryMode: 'initial' | 'switch'
	}

	let { data }: { data: FavoritesPageData } = $props()
	const messages = $derived(page.data.i18n?.messages)
	const t = (key: string, params?: Record<string, string | number>) =>
		translate(messages, key, params)

	let activeCollection = $state('all')
	let contentPanelSequence = 0
	let renderedCollection = $state<string | null>(null)
	let contentPanels = $state<FavoriteContentPanel[]>([])

	const visibleEntries = $derived.by(() =>
		data.entries.filter((entry) => matchesActiveCollection(entry))
	)
	const renderedContentPanels = $derived.by(() =>
		contentPanels.length
			? contentPanels
			: [
					{
						key: `${activeCollection}:0`,
						collection: activeCollection,
						entries: visibleEntries,
						phase: 'current' as const,
						entryMode: 'initial' as const
					}
				]
	)

	$effect(() => {
		const nextCollection = activeCollection
		const nextEntries = visibleEntries

		if (renderedCollection === null) {
			renderedCollection = nextCollection
			contentPanels = [
				{
					key: `${nextCollection}:${contentPanelSequence}`,
					collection: nextCollection,
					entries: nextEntries,
					phase: 'current',
					entryMode: 'initial'
				}
			]
			return
		}

		if (nextCollection === renderedCollection) {
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
				key: `${nextCollection}:${++contentPanelSequence}`,
				collection: nextCollection,
				entries: nextEntries,
				phase: 'current',
				entryMode: 'switch'
			}
		]
		renderedCollection = nextCollection
	})

	function matchesActiveCollection(entry: FavoriteEntry) {
		return activeCollection === 'all' || entry.collection === activeCollection
	}

	function kindLabel(kind: FavoriteKind) {
		return t(`favorites.kind.${kind}`)
	}

	function collectionLabel(collectionId: string) {
		return (
			data.collections.find((collection) => collection.id === collectionId)?.title ?? collectionId
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
		<span>{kindLabel(item.kind)}</span>
		<span>{collectionLabel(item.collection)}</span>
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
					class:info-flow-filter-active={activeCollection === 'all'}
					type="button"
					aria-pressed={activeCollection === 'all'}
					onclick={() => {
						activeCollection = 'all'
					}}
				>
					{t('common.all')}
				</button>
				{#each data.collections as collection (collection.id)}
					<button
						class:info-flow-filter-active={activeCollection === collection.id}
						type="button"
						aria-pressed={activeCollection === collection.id}
						onclick={() => {
							activeCollection = collection.id
						}}
					>
						{collection.title}
					</button>
				{/each}
			</div>

			<div class="info-flow-band-side" aria-label={t('favorites.summaryAria')}>
				<div class="info-flow-stat">
					<span>{t('favorites.totalLabel')}</span>
					<strong>{data.totalEntries}</strong>
				</div>
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
													href={resolve(item.href)}
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
									<h2>{t('favorites.emptyTitle')}</h2>
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
