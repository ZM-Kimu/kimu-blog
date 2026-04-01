<script lang="ts">
	import { page } from '$app/state'
	import { translate } from '$lib/i18n'
	import SubpageScreen from '$lib/components/layout/SubpageScreen.svelte'
	import TagPage from '$lib/features/blog/TagPage.svelte'
	import SeoHead from '$lib/components/ui/SeoHead.svelte'

	let { data } = $props()
	const messages = $derived(page.data.i18n?.messages)
</script>

<SeoHead
	title={translate(messages, 'seo.tag.title', { tag: data.tag.name })}
	description={translate(messages, 'seo.tag.description', { tag: data.tag.name })}
	pathname={`/tags/${data.tag.slug}`}
/>

<SubpageScreen>
	<TagPage {data} />
</SubpageScreen>
