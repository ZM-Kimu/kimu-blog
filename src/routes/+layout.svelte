<script lang="ts">
	import { browser } from '$app/environment'
	import { onNavigate } from '$app/navigation'
	import { page } from '$app/state'
	import { onDestroy, onMount, tick } from 'svelte'
	import { untrack } from 'svelte'
	import '$lib/../app.css'

	import favicon from '$lib/assets/favicon.svg'
	import BackgroundStage from '$lib/components/layout/BackgroundStage.svelte'
	import DockNav from '$lib/components/layout/DockNav.svelte'
	import Footer from '$lib/components/layout/Footer.svelte'
	import Header from '$lib/components/layout/Header.svelte'
	import PublicTopbarManager from '$lib/components/layout/PublicTopbarManager.svelte'
	import { siteConfig } from '$lib/config/site'
	import { setNavigationContext } from '$lib/navigation/context'
	import { createNavigationStateManager } from '$lib/navigation/navigation-state.svelte'
	import { createPageState } from '$lib/navigation/page-state'
	import { resolveRouteState } from '$lib/navigation/route-state'
	import type { TopbarShellVariant } from '$lib/navigation/types'
	import { bindMediaQuery } from '$lib/features/home/home-page.media'

	type SiteBootPhase = 'loading' | 'staged' | 'entering' | 'ready'
	type PublicTopbarManagerHandle = {
		bridgeTo: (targetShellVariant: TopbarShellVariant) => Promise<void>
	}

	const compactQuery = '(max-width: 900px), (max-aspect-ratio: 145/100)'
	const reducedMotionQuery = '(prefers-reduced-motion: reduce)'
	const desktopHomeEnterDurationMs = 830
	const desktopSubpageEnterDurationMs = 740

	let { children, data } = $props()
	let siteFrame: HTMLDivElement | null = $state(null)
	let publicTopbarManager: PublicTopbarManagerHandle | null = $state(null)
	let isCompactLayout = $state(false)
	let prefersReducedMotion = $state(false)
	let desktopHomeEnterActive = $state(false)
	let desktopSubpageEnterActive = $state(false)
	let queuedDesktopEnterVariant = $state<'none' | 'subpage'>('none')
	let siteBootPhase = $state<SiteBootPhase>(
		page.url.pathname === '/manage' || page.url.pathname.startsWith('/manage/')
			? 'ready'
			: 'loading'
	)
	let siteBootEnterDurationMs = $state(620)

	const navigationManager = createNavigationStateManager(
		untrack(() => resolveRouteState({ pathname: page.url.pathname, status: page.status })),
		untrack(() =>
			createPageState({
				routeState: resolveRouteState({ pathname: page.url.pathname, status: page.status }),
				data,
				messages: data.i18n?.messages
			})
		)
	)

	setNavigationContext({ navigationManager })

	const messages = $derived(data.i18n?.messages)
	const routeState = $derived(
		resolveRouteState({ pathname: page.url.pathname, status: page.status })
	)
	const pageState = $derived(
		createPageState({
			routeState,
			data,
			messages
		})
	)
	const isManageRoute = $derived(routeState.kind === 'manage')
	const isPublicScreenRoute = $derived(pageState.shellMode === 'screen' && !isManageRoute)
	const isBareRoute = $derived(isPublicScreenRoute || isManageRoute)
	const showGlobalChrome = $derived(pageState.showGlobalChrome)
	const isRouteOutgoing = $derived(navigationManager.phase === 'exiting')
	const isRouteEntering = $derived(
		navigationManager.phase === 'entering' && navigationManager.pendingTarget === page.url.pathname
	)
	const showBackgroundStage = $derived(
		isBareRoute ||
			navigationManager.phase !== 'idle' ||
			navigationManager.backgroundScene !== 'neutral-default' ||
			navigationManager.pendingBackgroundScene !== null
	)
	const routeTransitionStyle = $derived(
		`--site-page-exit-duration: ${navigationManager.exitDurationMs}ms; --site-page-enter-duration: ${navigationManager.enterDurationMs}ms;`
	)
	let desktopHomeEnterTimer: ReturnType<typeof setTimeout> | null = null
	let desktopSubpageEnterTimer: ReturnType<typeof setTimeout> | null = null

	function clearDesktopHomeEnterTimer() {
		if (desktopHomeEnterTimer === null) {
			return
		}

		clearTimeout(desktopHomeEnterTimer)
		desktopHomeEnterTimer = null
	}

	function clearDesktopSubpageEnterTimer() {
		if (desktopSubpageEnterTimer === null) {
			return
		}

		clearTimeout(desktopSubpageEnterTimer)
		desktopSubpageEnterTimer = null
	}

	function resolvePreviewRouteState(pathname: string) {
		const previewStatus =
			pathname === '/__debug/error-404' ? 404 : pathname === '/__debug/error-500' ? 500 : 200
		const previewRouteState = resolveRouteState({
			pathname,
			status: previewStatus
		})

		if (previewRouteState.kind !== 'unknown') {
			return previewRouteState
		}

		return resolveRouteState({
			pathname,
			status: 404
		})
	}

	function wait(durationMs: number) {
		if (durationMs <= 0) {
			return Promise.resolve()
		}

		return new Promise<void>((resolvePromise) => {
			setTimeout(resolvePromise, durationMs)
		})
	}

	onDestroy(() => {
		clearDesktopHomeEnterTimer()
		clearDesktopSubpageEnterTimer()
	})

	onNavigate((navigation) => {
		if (navigation.willUnload || !navigation.to?.url) {
			return
		}

		const targetPath = navigation.to.url.pathname
		if (targetPath === page.url.pathname) {
			return
		}

		clearDesktopHomeEnterTimer()
		clearDesktopSubpageEnterTimer()
		desktopHomeEnterActive = false
		desktopSubpageEnterActive = false
		queuedDesktopEnterVariant = 'none'

		const targetRouteState = resolvePreviewRouteState(targetPath)
		const targetPageState = createPageState({
			routeState: targetRouteState,
			data,
			messages
		})
		const started = navigationManager.beginPageSwitch(targetPath, targetPageState, {
			origin: `navigate:${navigation.type}`,
			reducedMotion: prefersReducedMotion
		})

		if (!started) {
			return
		}

		if (
			!isCompactLayout &&
			routeState.kind === 'home' &&
			targetPageState.shellMode === 'screen' &&
			targetRouteState.kind !== 'home'
		) {
			queuedDesktopEnterVariant = 'subpage'
		}

		void navigation.complete.catch(() => {
			navigationManager.cancelPageSwitch()
		})

		return (async () => {
			await wait(navigationManager.exitDurationMs)
			if (navigationManager.pendingTarget !== targetPath) {
				return
			}

			navigationManager.startBackgroundBridge({ deferUntilEntering: !isCompactLayout })
			await tick()
			if (navigationManager.pendingTarget !== targetPath) {
				return
			}

			const topbarBridgePromise =
				publicTopbarManager?.bridgeTo(targetPageState.topbarShellVariant).catch(() => undefined) ??
				Promise.resolve()

			if (!isCompactLayout) {
				void topbarBridgePromise
				return
			}

			await Promise.all([wait(navigationManager.bridgeDurationMs), topbarBridgePromise])
		})()
	})

	$effect(() => {
		if (!browser || !data?.i18n?.locale) {
			return
		}

		document.documentElement.lang = data.i18n.locale
		document.documentElement.dataset.locale = data.i18n.locale
	})

	$effect(() => {
		if (!browser) {
			return
		}

		document.documentElement.dataset.siteBootPhase = siteBootPhase
	})

	$effect(() => {
		const nextRouteState = routeState
		const nextPageState = pageState
		const nextLocale = data.i18n?.locale

		untrack(() => {
			navigationManager.sync(nextRouteState, nextPageState, nextLocale)
		})
	})

	$effect(() => {
		if (!browser) {
			return
		}

		document.documentElement.dataset.cursorMode = navigationManager.cursorMode
	})

	$effect(() => {
		if (!browser) {
			return
		}

		if (routeState.kind !== 'home' || isCompactLayout) {
			clearDesktopHomeEnterTimer()
			desktopHomeEnterActive = false
		} else if (isRouteEntering) {
			clearDesktopHomeEnterTimer()
			desktopHomeEnterActive = true
			desktopHomeEnterTimer = setTimeout(() => {
				desktopHomeEnterTimer = null
				desktopHomeEnterActive = false
			}, prefersReducedMotion ? 1 : desktopHomeEnterDurationMs)
		}
	})

	$effect(() => {
		if (!browser) {
			return
		}

		if (!isPublicScreenRoute || routeState.kind === 'home' || isCompactLayout) {
			clearDesktopSubpageEnterTimer()
			desktopSubpageEnterActive = false
			if (routeState.kind === 'home' || isCompactLayout) {
				queuedDesktopEnterVariant = 'none'
			}
			return
		}

		if (!isRouteEntering || queuedDesktopEnterVariant !== 'subpage') {
			return
		}

		queuedDesktopEnterVariant = 'none'
		clearDesktopSubpageEnterTimer()
		desktopSubpageEnterActive = true
		desktopSubpageEnterTimer = setTimeout(() => {
			desktopSubpageEnterTimer = null
			desktopSubpageEnterActive = false
		}, prefersReducedMotion ? 1 : desktopSubpageEnterDurationMs)
	})

	onMount(() => {
		navigationManager.hydrateClientRuntime()

		const unbindCompact = bindMediaQuery(compactQuery, (matches) => {
			isCompactLayout = matches
		})
		const unbindReducedMotion = bindMediaQuery(reducedMotionQuery, (matches) => {
			prefersReducedMotion = matches
		})

		if (routeState.kind === 'manage') {
			siteBootPhase = 'ready'
			siteBootEnterDurationMs = 0

			return () => {
				unbindCompact()
				unbindReducedMotion()
			}
		}

		const loadingDurationMs = prefersReducedMotion ? 120 : 1100
		const stagedDurationMs = prefersReducedMotion ? 60 : 220
		const enteringDurationMs = prefersReducedMotion ? 160 : 620
		siteBootEnterDurationMs = enteringDurationMs
		let isDisposed = false
		const timers: ReturnType<typeof setTimeout>[] = []

		const schedule = (callback: () => void, delay: number) => {
			const timer = setTimeout(() => {
				const timerIndex = timers.indexOf(timer)
				if (timerIndex >= 0) {
					timers.splice(timerIndex, 1)
				}

				if (!isDisposed) {
					callback()
				}
			}, delay)

			timers.push(timer)
		}

		schedule(() => {
			siteBootPhase = 'staged'
			schedule(() => {
				siteBootPhase = 'entering'
				schedule(() => {
					siteBootPhase = 'ready'
				}, enteringDurationMs)
			}, stagedDurationMs)
		}, loadingDurationMs)

		return () => {
			isDisposed = true
			unbindCompact()
			unbindReducedMotion()

			for (const timer of timers) {
				clearTimeout(timer)
			}

			timers.length = 0
		}
	})
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="application-name" content={siteConfig.name} />
</svelte:head>

<div
	class="site-frame"
	data-site-boot-phase={siteBootPhase}
	style={`--site-boot-enter-duration: ${siteBootPhase === 'ready' ? 0 : siteBootEnterDurationMs}ms;`}
	bind:this={siteFrame}
>
	{#if showBackgroundStage}
		<BackgroundStage
			scene={navigationManager.backgroundScene}
			pendingScene={navigationManager.pendingBackgroundScene}
			bridgeActive={navigationManager.backgroundBridgeActive}
			compact={isCompactLayout}
			reducedMotion={prefersReducedMotion}
			bridgeDurationMs={navigationManager.bridgeDurationMs}
			allowWarmup={siteBootPhase === 'ready'}
		/>
	{/if}

	<PublicTopbarManager
		host={siteFrame}
		{messages}
		compact={isCompactLayout}
		reducedMotion={prefersReducedMotion}
		bind:this={publicTopbarManager}
	/>

	{#if showGlobalChrome}
		<Header {messages} />
	{/if}

	<main
		class:site-main--bare={isBareRoute}
		class:site-main--home={routeState.kind === 'home'}
		class="site-main"
	>
		{#if isPublicScreenRoute}
			<div
				class:screen-route-layer--entering={isRouteEntering}
				class:screen-route-layer--exiting={isRouteOutgoing}
				class:screen-route-layer--home-enter-desktop={desktopHomeEnterActive}
				class:screen-route-layer--subpage-enter-desktop={desktopSubpageEnterActive}
				class="screen-route-layer"
				style={routeTransitionStyle}
			>
				{@render children()}
			</div>
		{:else if isManageRoute}
			<div
				class:site-bare-content--entering={isRouteEntering}
				class:site-bare-content--exiting={isRouteOutgoing}
				class="site-bare-content"
				style={routeTransitionStyle}
			>
				{@render children()}
			</div>
		{:else}
			<div
				class:site-main__inner--entering={isRouteEntering}
				class:site-main__inner--exiting={isRouteOutgoing}
				class="shell site-main__inner"
				style={routeTransitionStyle}
			>
				{@render children()}
			</div>
		{/if}
	</main>

	{#if showGlobalChrome}
		<DockNav {messages} />
		<Footer {messages} />
	{/if}
</div>
