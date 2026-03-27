<script lang="ts">
	import { browser } from '$app/environment'
	import { page } from '$app/state'
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

	let { children, data } = $props()
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
		navigationManager.sync(routeState, pageState)
	})
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="application-name" content={siteConfig.name} />
</svelte:head>

<div class:site-frame--home={isScreenRoute} class="site-frame">
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
