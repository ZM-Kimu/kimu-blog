<script lang="ts">
	import './home.css';
	import { resolve } from '$app/paths';
	import { homeDockItems, homeQuickActions, missionCatalog } from '$lib/constants/command-center';
	import { siteConfig } from '$lib/constants/site';
	import SeoHead from '$lib/components/ui/SeoHead.svelte';

	let { data } = $props();
	let homeTopbarType = $state<'a' | 'b'>('b');

	const totalCategories = $derived(data.categories.length);
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
		{ label: 'Logs', value: String(data.totalPosts).padStart(2, '0'), accent: 'logs', abbr: 'Lg' },
		{
			label: 'Missions',
			value: String(totalCategories).padStart(2, '0'),
			accent: 'missions',
			abbr: 'Ms'
		},
		{ label: 'Mode', value: 'LIVE', accent: 'mode', abbr: 'Md' }
	]);

	const topbarActions = [
		{ href: '/updates', label: 'Live' },
		{ href: '/favorites', label: 'Fav' },
		{ href: '/about', label: 'Info' }
	] as const;

	function toggleHomeTopbar(event: MouseEvent) {
		event.preventDefault();
		homeTopbarType = homeTopbarType === 'a' ? 'b' : 'a';
	}
</script>

<SeoHead
	description="Kimu Blog 的主界面。以 game home screen 的方式组织个人信息、动态和内容入口。"
/>

<section class="home-shell">
	<div class="screen-home">
		<div class="home-room" aria-hidden="true"></div>
		<div class="home-light home-light--left" aria-hidden="true"></div>
		<div class="home-light home-light--right" aria-hidden="true"></div>

		{#if homeTopbarType === 'a'}
			<header class="home-topbar home-topbar--a" aria-label="Home top bar type A">
				<div class="home-topbar__lead">
					<button
						class="home-topbar__back"
						type="button"
						aria-label="Switch to type B top bar"
						onclick={() => (homeTopbarType = 'b')}
					>
						<span class="home-topbar__back-glyph" aria-hidden="true"></span>
					</button>
					<div class="home-topbar__title-wrap">
						<div class="home-topbar__title">{siteConfig.name}</div>
					</div>
				</div>

				<div class="home-topbar__aside home-topbar__aside--a">
					<div class="home-topbar__resources" aria-label="Home resources">
						{#each topMetrics as metric, index (metric.label)}
							<div class="home-topbar__resource-slot">
								<div class="resource-chip">
									<span>{metric.label}</span>
									<strong>{metric.value}</strong>
								</div>
								{#if index < topMetrics.length - 1}
									<span class="home-topbar__resource-divider" aria-hidden="true">/</span>
								{/if}
							</div>
						{/each}
					</div>

					<div class="home-topbar__tools" aria-label="Home top bar actions">
						{#each topbarActions as action, index (action.href)}
							<a class="home-topbar__tool-button" href={resolve(action.href)}>{action.label}</a>
							{#if index < topbarActions.length - 1}
								<span class="home-topbar__tool-divider" aria-hidden="true">/</span>
							{/if}
						{/each}
					</div>
				</div>
			</header>
		{:else}
			<header class="home-topbar home-topbar--b" aria-label="Home top bar type B">
				<a class="home-profile-chip" href={resolve('/about')}>
					<span class="home-profile-chip__level">Lv.</span>
					<strong>90</strong>
					<div class="home-profile-chip__copy">
						<small>Operator</small>
						<span>{siteConfig.author}</span>
					</div>
				</a>

				<div class="home-topbar__aside">
					<div class="home-topbar__resources">
						{#each topMetrics as metric (metric.label)}
							<div class="resource-chip">
								<span>{metric.label}</span>
								<strong>{metric.value}</strong>
							</div>
						{/each}
					</div>

					<div class="home-topbar__tools" aria-label="Home top bar tools">
						{#each topbarActions as action, index (action.href)}
							<a class="home-topbar__tool-button" href={resolve(action.href)}>{action.label}</a>
							{#if index < topbarActions.length - 1}
								<span class="home-topbar__tool-divider" aria-hidden="true">/</span>
							{/if}
						{/each}
					</div>
				</div>
			</header>
		{/if}

		<aside class="home-left-tools">
			{#each homeQuickActions as action (action.href)}
				<a class={`tool-chip tool-chip--${action.accent}`} href={resolve(action.href)}>
					<span class="tool-chip__icon" aria-hidden="true"></span>
					<span class="tool-chip__label">{action.label}</span>
				</a>
			{/each}
		</aside>

		<aside class="home-right-pane">
			{#if data.featuredPost}
				<a class="home-event-banner" href={resolve(data.featuredPost.permalink)}>
					<span class="home-event-banner__tag">Featured</span>
					<strong>{data.featuredPost.title}</strong>
					<small>{data.featuredPost.category ?? '未分类'}</small>
				</a>
			{/if}

			<a class="action--work" href={resolve('/blog')} onclick={toggleHomeTopbar}>
				<span class="action__badge">Main</span>
				<span class="action__label">进入内容</span>
				<span class="action__label action__label--primary">分类界面</span>
			</a>
		</aside>

		<section class="home-mission-strip" aria-label="Mission banner">
			<div class="mission-strip__marquee">
				{#each [false, true] as isClone}
					<div class="mission-strip__group" aria-hidden={isClone}>
						{#each missionPreview as mission (`${isClone ? 'clone' : 'base'}-${mission.slug}`)}
							<a
								class={`mission-strip__item mission-strip__item--${mission.tone}`}
								href={mission.href}
								tabindex={isClone ? -1 : undefined}
							>
								<span>{mission.kicker}</span>
								<strong>{mission.title}</strong>
								<small>{String(mission.count).padStart(2, '0')} records</small>
								<em>{mission.state}</em>
							</a>
						{/each}
					</div>
				{/each}
			</div>
		</section>

		<footer class="home-footer">
			<nav class="home-footer__dock" aria-label="主入口">
				{#each homeDockItems as item (item.href)}
					<a class={`dock-item dock-item--${item.accent}`} href={resolve(item.href)}>
						<span class="dock-item__icon"></span>
						<span class="dock-item__code">{item.code}</span>
						<span class="dock-item__label">{item.label}</span>
					</a>
				{/each}
			</nav>
		</footer>
	</div>

	<section class="home-height-guard panel" role="status" aria-live="polite">
		<p class="eyebrow">Viewport Guard</p>
		<h2>当前窗口高度不足</h2>
		<p>Home shell 需要至少 500px 的可见高度。请增大浏览器窗口，或先切换到内容页。</p>
		<div class="home-height-guard__actions">
			<a class="button-primary" href={resolve('/blog')}>进入内容页</a>
			<a class="section-link" href={resolve('/about')}>查看简介</a>
		</div>
	</section>
</section>
