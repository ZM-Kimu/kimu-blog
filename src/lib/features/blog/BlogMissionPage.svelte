<script lang="ts">
	import { page } from '$app/state'
	import { resolve } from '$app/paths'
	import { translate } from '$lib/i18n'
	import type { BlogPost, CategorySummary } from '$lib/types/content'
	import { missionCatalog } from './config'
	import MissionCard from './components/MissionCard.svelte'
	import PostCard from './components/PostCard.svelte'

	let {
		data
	}: {
		data: {
			categories: CategorySummary[]
			latestPosts: BlogPost[]
			totalPosts: number
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

<section class="mission-screen">
	<section class="panel mission-intro">
		<div>
			<p class="eyebrow">{t('blog.mission.introEyebrow')}</p>
			<h1>{t('blog.mission.introTitle')}</h1>
			<p>{t('blog.mission.introDescription')}</p>
		</div>

		<div class="hero-actions">
			<a class="button-primary" href={resolve('/blog/archive')}>{t('blog.mission.archiveCta')}</a>
			<a class="button-secondary" href={resolve('/')}>{t('blog.mission.homeCta')}</a>
		</div>
	</section>

	<div class="mission-layout">
		<section class="panel mission-board">
			<div class="panel-heading">
				<div>
					<p class="eyebrow">{t('blog.mission.boardEyebrow')}</p>
					<h2>{t('blog.mission.boardTitle')}</h2>
				</div>
				<strong class="metric-pill">
					{t('common.records', { count: String(data.totalPosts).padStart(2, '0') })}
				</strong>
			</div>

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
		</section>

		<aside class="panel mission-side">
			<div class="panel-heading">
				<div>
					<p class="eyebrow">{t('blog.mission.recentEyebrow')}</p>
					<h2>{t('blog.mission.recentTitle')}</h2>
				</div>
			</div>

			<div class="mission-side-list">
				{#each data.latestPosts as post (post.slug)}
					<PostCard {post} />
				{/each}
			</div>
		</aside>
	</div>
</section>
