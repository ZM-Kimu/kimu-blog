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
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="application-name" content={siteConfig.name} />
</svelte:head>

<div class:site-frame--home={isHomeRoute} class="site-frame">
	{#if !isHomeRoute}
		<Header />
	{/if}

	<main class:site-main--home={isHomeRoute} class="site-main">
		{#if isHomeRoute}
			{@render children()}
		{:else}
			<div class="shell site-main__inner">
				{@render children()}
			</div>
		{/if}
	</main>

	{#if !isHomeRoute}
		<DockNav />
		<Footer />
	{/if}
</div>
