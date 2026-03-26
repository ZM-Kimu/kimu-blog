<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { homeDockItems, homeQuickActions } from '$lib/constants/command-center';
	import { siteConfig } from '$lib/constants/site';
	import { bindMediaQuery } from './home-screen.media';
	import type { HomeScreenData } from './home-screen.types';
	import { createHomeScreenViewModel } from './home-screen.view-model';
	import HomeTopbar from './topbar/HomeTopbar.svelte';
	import type { TopbarMode } from './topbar/home-topbar.types';

	type HomeTopbarHandle = {
		toggle: (origin: 'cta' | 'back') => void;
	};

	const compactQuery = '(max-width: 900px), (max-aspect-ratio: 145/100)';
	const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

	let { data }: { data: HomeScreenData } = $props();
	let screenHome: HTMLDivElement | null = $state(null);
	let homeTopbar: HomeTopbarHandle | null = $state(null);
	let isCompactLayout = $state(false);
	let prefersReducedMotion = $state(false);
	let topbarMode = $state<TopbarMode>('main');
	let topbarMotionLocked = $state(false);

	const viewModel = $derived.by(() => createHomeScreenViewModel(data));

	function handleTopbarStateChange(event: CustomEvent<{ mode: TopbarMode; locked: boolean }>) {
		topbarMode = event.detail.mode;
		topbarMotionLocked = event.detail.locked;
	}

	onMount(() => {
		const unbindCompact = bindMediaQuery(compactQuery, (matches) => {
			isCompactLayout = matches;
		});
		const unbindReducedMotion = bindMediaQuery(reducedMotionQuery, (matches) => {
			prefersReducedMotion = matches;
		});

		return () => {
			unbindCompact();
			unbindReducedMotion();
		};
	});
</script>

<section class="home-shell">
	<div class="screen-home" bind:this={screenHome}>
		<div class="home-room" aria-hidden="true"></div>
		<div class="home-light home-light--left" aria-hidden="true"></div>
		<div class="home-light home-light--right" aria-hidden="true"></div>

		<HomeTopbar
			host={screenHome}
			metrics={viewModel.topMetrics}
			actions={viewModel.topbarActions}
			siteName={siteConfig.name}
			authorName={siteConfig.author}
			profileLevel="90"
			profileHref="/about"
			compact={isCompactLayout}
			reducedMotion={prefersReducedMotion}
			bind:this={homeTopbar}
			on:statechange={handleTopbarStateChange}
		/>

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
				<a class="home-event-banner" href={data.featuredPost.permalink}>
					<span class="home-event-banner__tag">Featured</span>
					<strong>{data.featuredPost.title}</strong>
					<small>{data.featuredPost.category ?? '未分类'}</small>
				</a>
			{/if}

			<button
				class="action--work"
				type="button"
				aria-controls="home-topbar-prototype"
				aria-pressed={topbarMode === 'subpage'}
				disabled={topbarMotionLocked}
				onclick={() => homeTopbar?.toggle('cta')}
			>
				<span class="action__badge">Main</span>
				<span class="action__label">进入内容</span>
				<span class="action__label action__label--primary">分类界面</span>
			</button>
		</aside>

		<section class="home-mission-strip" aria-label="Mission banner">
			<div class="mission-strip__marquee">
				{#each [false, true] as isClone}
					<div class="mission-strip__group" aria-hidden={isClone}>
						{#each viewModel.missionPreview as mission (`${isClone ? 'clone' : 'base'}-${mission.slug}`)}
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
