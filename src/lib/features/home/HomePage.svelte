<script lang="ts">
	import { goto } from '$app/navigation'
	import { resolve } from '$app/paths'
	import { onMount, tick } from 'svelte'
	import { siteConfig } from '$lib/config/site'
	import { translate, type I18nPayload } from '$lib/i18n'
	import { getNavigationContext } from '$lib/navigation/context'
	import { createPageState } from '$lib/navigation/page-state'
	import { resolveRouteState } from '$lib/navigation/route-state'
	import { homeDockItems, homeQuickActions } from './config'
	import SpineHomeBackground from './background/SpineHomeBackground.svelte'
	import { bindMediaQuery } from './home-page.media'
	import type { HomePageData } from './home-page.types'
	import { createHomePageViewModel } from './home-page.view-model'
	import HomeTopbar from './topbar/HomeTopbar.svelte'
	import TopbarReopenButton from './topbar/TopbarReopenButton.svelte'
	import TopbarSettingsModal from './topbar/TopbarSettingsModal.svelte'
	import type { HomeTopbarActionDetail, TopbarMode } from './topbar/home-topbar.types'

	type HomeTopbarHandle = {
		transitionTo: (nextMode: TopbarMode, origin: 'cta' | 'back') => Promise<void>
	}

	const compactQuery = '(max-width: 900px), (max-aspect-ratio: 145/100)'
	const reducedMotionQuery = '(prefers-reduced-motion: reduce)'
	const homeWorkTarget = '/__debug/error-404'
	const homeWorkTargetStatus = 404
	const topbarCollapseDurationMs = 220

	let { data }: { data: HomePageData & { i18n?: I18nPayload } } = $props()
	let screenHome: HTMLDivElement | null = $state(null)
	let homeTopbar: HomeTopbarHandle | null = $state(null)
	let isCompactLayout = $state(false)
	let prefersReducedMotion = $state(false)
	let siteBootPhase = $state<'loading' | 'staged' | 'entering' | 'ready'>('loading')
	let topbarMode = $state<TopbarMode>('main')
	let topbarMotionLocked = $state(false)

	const { navigationManager } = getNavigationContext()
	const messages = $derived(data.i18n?.messages)
	const viewModel = $derived.by(() => createHomePageViewModel(data))
	const currentTopbarState = $derived(navigationManager.pageState.topbar)
	const pendingTopbarState = $derived(
		navigationManager.pendingPageState?.topbar ?? currentTopbarState
	)
	const homeBodyPhase = $derived(navigationManager.phase === 'exiting' ? 'exiting' : 'idle')
	const pageExitDurationMs = $derived(prefersReducedMotion ? 140 : 320)
	const topbarCollapsed = $derived(navigationManager.topbarCollapsed)
	const settingsOpen = $derived(
		navigationManager.settingsOpen && topbarMode === 'main' && !topbarCollapsed
	)
	const cursorMode = $derived(navigationManager.cursorMode)
	const backgroundAnimationPreference = $derived(navigationManager.backgroundAnimationPreference)
	const backgroundAnimationStatus = $derived(navigationManager.backgroundAnimationStatus)
	const backgroundAnimationDisabled = $derived(isCompactLayout || prefersReducedMotion)
	const backgroundAnimationDescription = $derived.by(() => {
		const segments = [t('topbar.settings.backgroundAnimationDescription')]

		if (backgroundAnimationDisabled) {
			segments.push(t('topbar.settings.backgroundAnimationDisabled'))
		} else if (backgroundAnimationStatus === 'failed') {
			segments.push(t('topbar.settings.backgroundAnimationFailed'))
		}

		return segments.join(' ')
	})
	const effectiveBackgroundAnimationEnabled = $derived(
		siteBootPhase === 'ready' &&
			backgroundAnimationPreference === 'on' &&
			!backgroundAnimationDisabled &&
			backgroundAnimationStatus !== 'failed'
	)

	function t(key: string) {
		return messages ? translate(messages, key) : key
	}

	function handleTopbarStateChange(event: CustomEvent<{ mode: TopbarMode; locked: boolean }>) {
		topbarMode = event.detail.mode
		topbarMotionLocked = event.detail.locked
	}

	function syncSiteBootPhase() {
		if (typeof document === 'undefined') {
			return
		}

		const nextPhase = document.documentElement.dataset.siteBootPhase
		if (
			nextPhase === 'loading' ||
			nextPhase === 'staged' ||
			nextPhase === 'entering' ||
			nextPhase === 'ready'
		) {
			siteBootPhase = nextPhase
		}
	}

	async function ensureExpandedTopbar() {
		if (!topbarCollapsed) {
			return
		}

		navigationManager.toggleTopbarCollapsed(false)
		await tick()
		await new Promise((resolvePromise) => {
			setTimeout(resolvePromise, prefersReducedMotion ? 140 : topbarCollapseDurationMs)
		})
	}

	async function handleTopbarAction(event: CustomEvent<HomeTopbarActionDetail>) {
		if (topbarMotionLocked) {
			return
		}

		switch (event.detail.action.key) {
			case 'language':
				await navigationManager.toggleLocale()
				break
			case 'collapse':
				navigationManager.toggleTopbarCollapsed()
				break
			case 'settings':
				navigationManager.openTopbarSettings()
				break
			case 'home':
				await goto(resolve('/'))
				break
		}
	}

	async function handleWorkAction() {
		if (topbarMotionLocked || navigationManager.phase !== 'idle' || !homeTopbar) {
			return
		}

		navigationManager.closeTopbarSettings()
		await ensureExpandedTopbar()

		const targetPageState = createPageState({
			routeState: resolveRouteState({ pathname: homeWorkTarget, status: homeWorkTargetStatus }),
			data,
			messages
		})

		const started = navigationManager.beginPageSwitch(homeWorkTarget, targetPageState, {
			origin: 'home-work',
			reducedMotion: prefersReducedMotion
		})

		if (!started) {
			return
		}

		try {
			await Promise.all([
				new Promise((resolvePromise) => {
					setTimeout(resolvePromise, pageExitDurationMs)
				}),
				homeTopbar.transitionTo('subpage', 'cta')
			])
			navigationManager.markNavigating()
			await goto(resolve(homeWorkTarget))
		} catch {
			navigationManager.cancelPageSwitch()
			await homeTopbar.transitionTo('main', 'back').catch(() => undefined)
		}
	}

	onMount(() => {
		syncSiteBootPhase()

		const unbindCompact = bindMediaQuery(compactQuery, (matches) => {
			isCompactLayout = matches
		})
		const unbindReducedMotion = bindMediaQuery(reducedMotionQuery, (matches) => {
			prefersReducedMotion = matches
		})
		const bootObserver = new MutationObserver(() => {
			syncSiteBootPhase()
		})
		bootObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-site-boot-phase']
		})

		return () => {
			unbindCompact()
			unbindReducedMotion()
			bootObserver.disconnect()
		}
	})
</script>

<svelte:window
	onkeydown={(event) => {
		if (settingsOpen && event.key === 'Escape') {
			navigationManager.closeTopbarSettings()
		}
	}}
/>

<section class="home-shell">
	<div
		class="screen-home"
		data-nav-phase={homeBodyPhase}
		style={`--home-page-exit-duration: ${pageExitDurationMs}ms;`}
		bind:this={screenHome}
	>
		<div class="home-room" aria-hidden="true"></div>
		<div class="home-light home-light--left" aria-hidden="true"></div>
		<div class="home-light home-light--right" aria-hidden="true"></div>
		{#if effectiveBackgroundAnimationEnabled}
			<SpineHomeBackground
				onStatusChange={(status) => navigationManager.setBackgroundAnimationStatus(status)}
			/>
		{/if}

		<div class:home-topbar-stage--collapsed={topbarCollapsed} class="home-topbar-stage">
			<HomeTopbar
				host={screenHome}
				mainMetrics={currentTopbarState.metrics}
				mainActions={currentTopbarState.actions}
				subpageMetrics={pendingTopbarState.metrics}
				subpageActions={pendingTopbarState.actions}
				subpageTitle={pendingTopbarState.title}
				authorName={siteConfig.author}
				profileLevel="90"
				profileHref="/about"
				compact={isCompactLayout}
				reducedMotion={prefersReducedMotion}
				bind:this={homeTopbar}
				on:action={handleTopbarAction}
				on:statechange={handleTopbarStateChange}
			/>

			{#if topbarCollapsed}
				<TopbarReopenButton
					ariaLabel={t('topbar.actions.expand')}
					onActivate={() => navigationManager.toggleTopbarCollapsed(false)}
				/>
			{/if}
		</div>

		{#if settingsOpen}
			<TopbarSettingsModal
				title={t('topbar.settings.title')}
				closeLabel={t('topbar.settings.close')}
				cursorLabel={t('topbar.settings.cursor')}
				cursorDescription={t('topbar.settings.cursorDescription')}
				customLabel={t('topbar.settings.custom')}
				systemLabel={t('topbar.settings.system')}
				backgroundAnimationLabel={t('topbar.settings.backgroundAnimation')}
				{backgroundAnimationDescription}
				backgroundAnimationOnLabel={t('topbar.settings.backgroundAnimationOn')}
				backgroundAnimationOffLabel={t('topbar.settings.backgroundAnimationOff')}
				{backgroundAnimationPreference}
				{backgroundAnimationDisabled}
				manageLabel={t('topbar.settings.manage')}
				manageDescription={t('topbar.settings.manageDescription')}
				manageActionLabel={t('topbar.settings.manageAction')}
				{cursorMode}
				onClose={() => navigationManager.closeTopbarSettings()}
				onSetCursorMode={(mode) => navigationManager.setCursorMode(mode)}
				onSetBackgroundAnimationPreference={(mode) =>
					navigationManager.setBackgroundAnimationPreference(mode)}
			/>
		{/if}

		<aside class="home-left-tools">
			{#each homeQuickActions as action (action.href)}
				<a class={`tool-chip tool-chip--${action.accent}`} href={resolve(action.href)}>
					<span class="tool-chip__icon" aria-hidden="true"></span>
					<span class="tool-chip__label">{t(action.labelKey)}</span>
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

			<button
				class="action--work"
				type="button"
				aria-controls="home-topbar-prototype"
				aria-pressed={topbarMode === 'subpage'}
				disabled={topbarMotionLocked || navigationManager.phase !== 'idle'}
				onclick={handleWorkAction}
			>
				<span class="action__badge">Main</span>
				<span class="action__label">{t('home.action.enterContent')}</span>
				<span class="action__label action__label--primary">{t('nav.blog')}</span>
			</button>
		</aside>

		<section class="home-mission-strip" aria-label="Mission banner">
			<div class="mission-strip__marquee">
				{#each [false, true] as isClone (isClone)}
					<div class="mission-strip__group" aria-hidden={isClone}>
						{#each viewModel.missionPreview as mission (`${isClone ? 'clone' : 'base'}-${mission.slug}`)}
							<a
								class={`mission-strip__item mission-strip__item--${mission.tone}`}
								href={resolve(mission.href)}
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
						<span class="dock-item__label">{t(item.labelKey)}</span>
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
