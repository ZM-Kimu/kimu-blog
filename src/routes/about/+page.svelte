<script lang="ts">
	import { page } from '$app/state'
	import { translate } from '$lib/i18n'
	import SubpageScreen from '$lib/components/layout/SubpageScreen.svelte'
	import AboutPage from '$lib/features/about/AboutPage.svelte'
	import SeoHead from '$lib/components/ui/SeoHead.svelte'

	const messages = $derived(page.data.i18n?.messages)
</script>

<SeoHead
	title={translate(messages, 'seo.about.title')}
	description={translate(messages, 'seo.about.description')}
	pathname="/about"
/>

<SubpageScreen>
	<AboutPage />
</SubpageScreen>
