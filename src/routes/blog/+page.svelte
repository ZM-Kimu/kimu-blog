<script lang="ts">
	import { page } from '$app/state'
	import { translate } from '$lib/i18n'
	import SubpageScreen from '$lib/components/layout/SubpageScreen.svelte'
	import BlogMissionPage from '$lib/features/blog/BlogMissionPage.svelte'
	import SeoHead from '$lib/components/ui/SeoHead.svelte'

	let { data } = $props()
	const messages = $derived(page.data.i18n?.messages)
</script>

<SeoHead
	title={translate(messages, 'seo.blog.title')}
	description={translate(messages, 'seo.blog.description')}
	pathname="/blog"
/>

<SubpageScreen>
	<BlogMissionPage {data} />
</SubpageScreen>
