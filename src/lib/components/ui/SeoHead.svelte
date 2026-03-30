<script lang="ts">
	import { siteConfig } from '$lib/config/site'

	interface Props {
		title?: string
		description?: string
		pathname?: string
		image?: string
		type?: 'website' | 'article'
		noindex?: boolean
	}

	let {
		title = siteConfig.name,
		description,
		pathname = '/',
		image = siteConfig.ogImage,
		type = 'website',
		noindex = false
	}: Props = $props()

	const resolvedTitle = $derived(
		title === siteConfig.name ? title : `${title} | ${siteConfig.name}`
	)
	const canonical = $derived(new URL(pathname, siteConfig.url).toString())
	const imageUrl = $derived(new URL(image, siteConfig.url).toString())
</script>

<svelte:head>
	<title>{resolvedTitle}</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
	<link rel="canonical" href={canonical} />
	<meta property="og:title" content={resolvedTitle} />
	{#if description}
		<meta property="og:description" content={description} />
	{/if}
	<meta property="og:type" content={type} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={imageUrl} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={resolvedTitle} />
	{#if description}
		<meta name="twitter:description" content={description} />
	{/if}
	<meta name="twitter:image" content={imageUrl} />
	{#if noindex}
		<meta name="robots" content="noindex,nofollow" />
	{/if}
</svelte:head>
