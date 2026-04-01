<script lang="ts">
	import { page } from '$app/state'
	import { translate } from '$lib/i18n'
	import type { CategorySummary } from '$lib/types/content'
	import { missionCatalog } from './config'
	import MissionCard from './components/MissionCard.svelte'

	let {
		data
	}: {
		data: {
			categories: CategorySummary[]
		}
	} = $props()

	const messages = $derived(page.data.i18n?.messages)
	const t = (key: string, params?: Record<string, string | number>) =>
		translate(messages, key, params)

	const missions = $derived.by(() =>
		missionCatalog.map((mission) => ({
			...mission,
			count:
				data.categories
					.filter(
						(category: CategorySummary) =>
							mission.matches.includes(category.slug) || mission.matches.includes(category.name)
					)
					.reduce((total: number, category: CategorySummary) => total + category.count, 0) ?? 0
		}))
	)
</script>

<section class="blog-mission-page">
	<div class="blog-mission-grid-rail">
		<div class="mission-grid">
			{#each missions as mission (mission.slug)}
				<MissionCard
					title={t(`home.missions.${mission.id}.title`)}
					kicker={t(`home.missions.${mission.id}.kicker`)}
					description={t(`home.missions.${mission.id}.description`)}
					href={mission.href}
					state={t(`home.missions.${mission.id}.state`)}
					tone={mission.tone}
					count={mission.count}
				/>
			{/each}
		</div>
	</div>
</section>
