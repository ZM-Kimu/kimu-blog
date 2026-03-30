<script lang="ts">
	import { page } from '$app/state'
	import { translate } from '$lib/i18n'
	import SubpageScreen from '$lib/components/layout/SubpageScreen.svelte'
	import BlogArchivePage from '$lib/features/blog/BlogArchivePage.svelte'
	import SeoHead from '$lib/components/ui/SeoHead.svelte'

	let { data } = $props()
	const messages = $derived(page.data.i18n?.messages)
</script>

<SeoHead
	title={translate(messages, 'seo.archive.title')}
	description={translate(messages, 'seo.archive.description')}
	pathname="/blog/archive"
/>

<SubpageScreen>
	<BlogArchivePage {data} />
</SubpageScreen>
