<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		commandNotices,
		homeDockItems,
		homeStatusFeed,
		missionCatalog
	} from '$lib/constants/command-center';
	import { siteConfig } from '$lib/constants/site';
	import SeoHead from '$lib/components/ui/SeoHead.svelte';

	let { data } = $props();

	const totalCategories = $derived(data.categories.length);
	const latestRecord = $derived(data.latestPosts[0] ?? null);
	const missionPreview = $derived.by(() =>
		missionCatalog.slice(0, 3).map((mission) => ({
			...mission,
			count:
				data.categories
					.filter(
						(category) =>
							mission.matches.includes(category.slug) || mission.matches.includes(category.name)
					)
					.reduce((total, category) => total + category.count, 0) ?? 0
		}))
	);

	const topMetrics = $derived([
		{ label: 'Logs', value: String(data.totalPosts).padStart(2, '0') },
		{ label: 'Missions', value: String(totalCategories).padStart(2, '0') },
		{ label: 'Mode', value: 'LIVE' }
	]);
</script>

<SeoHead
	description="Kimu Blog 的主界面。以 game home screen 的方式组织个人信息、动态和内容入口。"
/>

<section class="home-shell">
	<div class="screen-home">
		<div class="home-room" aria-hidden="true"></div>
		<div class="home-light home-light--left" aria-hidden="true"></div>
		<div class="home-light home-light--right" aria-hidden="true"></div>

		<header class="home-topbar">
			<a class="home-profile-chip" href={resolve('/about')}>
				<span class="home-profile-chip__level">Lv.</span>
				<strong>90</strong>
				<div class="home-profile-chip__copy">
					<small>Operator</small>
					<span>{siteConfig.author}</span>
				</div>
			</a>

			<div class="home-topbar__resources">
				{#each topMetrics as metric (metric.label)}
					<div class="resource-chip">
						<span>{metric.label}</span>
						<strong>{metric.value}</strong>
					</div>
				{/each}
			</div>
		</header>

		<div class="home-left-tools">
			{#each commandNotices.slice(0, 2) as notice, index (notice.title)}
				{#if index === 0}
					<a class="tool-button" href={resolve('/updates')}>
						<span class="tool-button__icon"></span>
						<span class="tool-button__label">{notice.title}</span>
					</a>
				{:else}
					<a class="tool-button" href={resolve('/favorites')}>
						<span class="tool-button__icon"></span>
						<span class="tool-button__label">{notice.title}</span>
					</a>
				{/if}
			{/each}
		</div>

		<section class="home-centerpiece">
			<div class="home-avatar" aria-hidden="true">
				<div class="home-avatar__stand"></div>
				<div class="home-avatar__body"></div>
				<div class="home-avatar__badge">portrait placeholder</div>
			</div>

			<div class="home-dialogue">
				<p class="eyebrow">Main Page</p>
				<h1>{siteConfig.name}</h1>
				<p>把个人信息、文章、分类、动态与收藏组织成 game home screen，而不是传统博客首页。</p>
				<div class="home-dialogue__actions">
					<a class="button-primary" href={resolve('/blog')}>进入分类</a>
					<a class="button-secondary" href={resolve('/blog/archive')}>查看归档</a>
				</div>
			</div>
		</section>

		<aside class="home-right-pane">
			{#if data.featuredPost}
				<a class="home-event-banner" href={resolve(data.featuredPost.permalink)}>
					<span class="home-event-banner__tag">Featured</span>
					<strong>{data.featuredPost.title}</strong>
					<small>{data.featuredPost.category ?? '未分类'}</small>
				</a>
			{/if}

			<div class="home-status-card">
				<p class="eyebrow">Status Feed</p>
				<ul>
					{#each homeStatusFeed as item (item.label)}
						<li>
							<span>{item.label}</span>
							<strong>{item.value}</strong>
						</li>
					{/each}
				</ul>
			</div>
		</aside>

		<section class="home-mission-strip">
			{#each missionPreview as mission (mission.slug)}
				<a class={`mission-strip-card mission-strip-card--${mission.tone}`} href={resolve('/blog')}>
					<span>{mission.kicker}</span>
					<strong>{mission.title}</strong>
					<small>{String(mission.count).padStart(2, '0')} records</small>
				</a>
			{/each}
		</section>

		{#if latestRecord}
			<section class="home-record-callout">
				<p class="eyebrow">Latest Record</p>
				<h2>{latestRecord.title}</h2>
				<p>{latestRecord.description}</p>
				<a href={resolve(latestRecord.permalink)}>Open dossier</a>
			</section>
		{/if}

		<div class="home-footer">
			<nav class="home-footer__dock" aria-label="主入口">
				{#each homeDockItems as item (item.href)}
					<a class={`dock-item dock-item--${item.accent}`} href={resolve(item.href)}>
						<span class="dock-item__icon"></span>
						<span class="dock-item__label">{item.label}</span>
					</a>
				{/each}
			</nav>

			<div class="home-footer__actions">
				<a class="action--event-list" href={resolve('/updates')}>
					<span class="action__badge">Live</span>
					<span class="action__label">动态列表</span>
				</a>

				<a class="action--work" href={resolve('/blog')}>
					<span class="action__badge">Main</span>
					<span class="action__label">进入内容</span>
					<span class="action__label action__label--primary">分类界面</span>
				</a>
			</div>
		</div>
	</div>
</section>
