<script lang="ts">
	import { resolve } from '$app/paths'
	import { homeQuickActions } from './config'
	import type { HomePageData } from './home-page.types'
	import { createHomePageViewModel } from './home-page.view-model'
	import { translate, type I18nPayload } from '$lib/i18n'

	let { data }: { data: HomePageData & { i18n?: I18nPayload } } = $props()

	const messages = $derived(data.i18n?.messages)
	const viewModel = $derived.by(() => createHomePageViewModel(data))

	function t(key: string, params?: Record<string, string | number>) {
		return translate(messages, key, params)
	}
</script>

<section class="portrait-home">
	<section class="portrait-home-tools panel">
		<div class="panel-heading">
			<div>
				<h2>{t('nav.home')}</h2>
			</div>
		</div>

		<div class="portrait-home-tools-grid">
			{#each homeQuickActions as action (action.href)}
				<a class={`tool-chip tool-chip--${action.accent}`} href={resolve(action.href)}>
					<span class="tool-chip-icon" aria-hidden="true"></span>
					<span class="tool-chip-label">{t(action.labelKey)}</span>
				</a>
			{/each}
		</div>
	</section>

	<section class="portrait-home-missions panel" aria-label={t('a11y.home.missionBanner')}>
		<div class="panel-heading">
			<div>
				<h2>{t('nav.blog')}</h2>
			</div>
		</div>

		<div class="portrait-home-mission-list">
			{#each viewModel.missionPreview as mission (mission.slug)}
				<a
					class={`mission-strip-item mission-strip-item-${mission.tone}`}
					href={resolve(mission.href)}
				>
					<span>{t(`home.missions.${mission.id}.kicker`)}</span>
					<strong>{t(`home.missions.${mission.id}.title`)}</strong>
					<small>{t('common.records', { count: String(mission.count).padStart(2, '0') })}</small>
					<em>{t(`home.missions.${mission.id}.state`)}</em>
				</a>
			{/each}
		</div>
	</section>
</section>
