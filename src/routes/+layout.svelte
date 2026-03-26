<script lang="ts">
	import { page } from '$app/state';
	import '$lib/../app.css';

	import favicon from '$lib/assets/favicon.svg';
	import DockNav from '$lib/components/layout/DockNav.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import { siteConfig } from '$lib/constants/site';

	let { children } = $props();

	const isHomeRoute = $derived(page.url.pathname === '/');
	const isErrorRoute = $derived(page.status >= 400);
	const isScreenRoute = $derived(isHomeRoute || isErrorRoute);
	const showGlobalChrome = $derived(!isHomeRoute && !isErrorRoute);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="application-name" content={siteConfig.name} />
</svelte:head>

<div class:site-frame--home={isScreenRoute} class="site-frame">
	{#if showGlobalChrome}
		<Header />
	{/if}

	<main class:site-main--home={isScreenRoute} class="site-main">
		{#if isScreenRoute}
			{@render children()}
		{:else}
			<div class="shell site-main__inner">
				{@render children()}
			</div>
		{/if}
	</main>

	{#if showGlobalChrome}
		<DockNav />
		<Footer />
	{/if}
</div>
