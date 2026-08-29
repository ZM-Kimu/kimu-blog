<script lang="ts">
	import { page } from '$app/state'
	import ScrollChrome from '$lib/components/ui/ScrollChrome.svelte'
	import { translate } from '$lib/i18n'
	import type { UpdateKind, UpdateStatus, UpdatesPageData } from '$lib/types/info-flow'
	import { formatDate } from '$lib/utils/date'

	let { data }: { data: UpdatesPageData } = $props()
	const messages = $derived(page.data.i18n?.messages)
	const locale = $derived(page.data.i18n?.locale)
	const t = (key: string, params?: Record<string, string | number>) =>
		translate(messages, key, params)

	const latestDateLabel = $derived(
		data.latestDate ? formatDate(data.latestDate, locale) : t('updates.emptyTitle')
	)

	function kindLabel(kind: UpdateKind) {
		return t(`updates.kind.${kind}`)
	}

	function statusLabel(status: UpdateStatus) {
		return t(`updates.status.${status}`)
	}
</script>

<section class="info-flow-screen updates-screen">
	<section class="panel updates-flow-panel" aria-label={t('updates.feedAria')}>
		<div class="info-flow-stage updates-stage">
			<ScrollChrome class="info-flow-scroll" viewportClass="info-flow-viewport">
				{#if data.groups.length}
					<div class="updates-timeline">
						{#each data.groups as group, index (group.id)}
							<section class="updates-group">
								<header class="updates-group-header">
									{#if index === 0}
										<div class="updates-group-summary" aria-label={t('updates.summaryAria')}>
											<div class="info-flow-stat">
												<span>{t('updates.totalLabel')}</span>
												<strong>{data.totalEntries}</strong>
											</div>
											<div class="info-flow-stat">
												<span>{t('updates.latestLabel')}</span>
												<strong>{latestDateLabel}</strong>
											</div>
										</div>
									{/if}
									<span>{group.label}</span>
									<i></i>
								</header>

								<div class="updates-group-list">
									{#each group.entries as entry (entry.id)}
										<article class="updates-card">
											<div
												class="updates-card-marker"
												data-update-status={entry.status}
												aria-hidden="true"
											></div>
											<div class="updates-card-main">
												<div class="info-flow-card-hud">
													<span>{kindLabel(entry.kind)}</span>
													<span>{statusLabel(entry.status)}</span>
													<time datetime={entry.date}>{formatDate(entry.date, locale)}</time>
												</div>
												<h2>{entry.title}</h2>
												<p>{entry.summary}</p>
											</div>
										</article>
									{/each}
								</div>
							</section>
						{/each}
					</div>
				{:else}
					<div class="info-flow-empty">
						<h2>{t('updates.emptyTitle')}</h2>
						<p>{t('updates.emptyDescription')}</p>
					</div>
				{/if}
			</ScrollChrome>
		</div>
	</section>
</section>
