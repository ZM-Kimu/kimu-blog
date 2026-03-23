<script lang="ts">
	import '$lib/../app.css';

	import favicon from '$lib/assets/favicon.svg';
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import { siteConfig } from '$lib/constants/site';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="application-name" content={siteConfig.name} />
</svelte:head>

<div class="site-frame">
	<Header />
	<main class="shell site-main">
		{@render children()}
	</main>
	<Footer />
</div>
