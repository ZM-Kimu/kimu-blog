<script lang="ts">
	import { resolve } from '$app/paths'
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
			<p class="eyebrow">Mission Page</p>
			<h1>内容分类界面</h1>
			<p>
				这里承担主分类选择，而不是传统博客文章流。一级卡片代表主要内容分区，完整时间顺序浏览下沉到归档页。
			</p>
		</div>

		<div class="hero-actions">
			<a class="button-primary" href={resolve('/blog/archive')}>进入完整归档</a>
			<a class="button-secondary" href={resolve('/')}>返回主界面</a>
		</div>
	</section>

	<div class="mission-layout">
		<section class="panel mission-board">
			<div class="panel-heading">
				<div>
					<p class="eyebrow">Primary Categories</p>
					<h2>Mission Board</h2>
				</div>
				<strong class="metric-pill">{String(data.totalPosts).padStart(2, '0')} records</strong>
			</div>

			<div class="mission-grid">
				{#each missions as mission (mission.slug)}
					<MissionCard
						title={mission.title}
						kicker={mission.kicker}
						description={mission.description}
						href={mission.href}
						state={mission.state}
						tone={mission.tone}
						count={mission.count}
					/>
				{/each}
			</div>
		</section>

		<aside class="panel mission-side">
			<div class="panel-heading">
				<div>
					<p class="eyebrow">Recent Output</p>
					<h2>Latest Records</h2>
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
