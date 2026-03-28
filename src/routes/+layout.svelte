<script lang="ts">
	import { browser } from '$app/environment'
	import { page } from '$app/state'
	import { onMount } from 'svelte'
	import { untrack } from 'svelte'
	import '$lib/../app.css'

	import favicon from '$lib/assets/favicon.svg'
	import DockNav from '$lib/components/layout/DockNav.svelte'
	import Footer from '$lib/components/layout/Footer.svelte'
	import Header from '$lib/components/layout/Header.svelte'
	import { siteConfig } from '$lib/config/site'
	import { setNavigationContext } from '$lib/navigation/context'
	import { createNavigationStateManager } from '$lib/navigation/navigation-state.svelte'
	import { createPageState } from '$lib/navigation/page-state'
	import { resolveRouteState } from '$lib/navigation/route-state'

	type SiteBootPhase = 'loading' | 'staged' | 'entering' | 'ready'

	let { children, data } = $props()
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
	const isManageRoute = $derived(
		page.url.pathname === '/manage' || page.url.pathname.startsWith('/manage/')
	)
	const isScreenRoute = $derived(pageState.shellMode === 'screen')
	const isBareRoute = $derived(isScreenRoute || isManageRoute)
	const showGlobalChrome = $derived(pageState.showGlobalChrome && !isManageRoute)
	const isShellEntering = $derived(
		navigationManager.phase === 'entering' && navigationManager.pendingTarget === page.url.pathname
	)

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

	onMount(() => {
		navigationManager.hydrateClientRuntime()

		if (page.url.pathname === '/manage' || page.url.pathname.startsWith('/manage/')) {
			siteBootPhase = 'ready'
			siteBootEnterDurationMs = 0
			return
		}

		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
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
			return timer
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
	class:site-frame--home={isScreenRoute}
	class="site-frame"
	data-site-boot-phase={siteBootPhase}
	style={`--site-boot-enter-duration: ${siteBootPhase === 'ready' ? 0 : siteBootEnterDurationMs}ms;`}
>
	{#if showGlobalChrome}
		<Header {messages} />
	{/if}

	<main class:site-main--home={isScreenRoute} class="site-main">
		{#if isBareRoute}
			{@render children()}
		{:else}
			<div
				class:site-main__inner--entering={isShellEntering}
				class="shell site-main__inner"
				style={`--site-page-enter-duration: ${navigationManager.enterDurationMs}ms;`}
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
