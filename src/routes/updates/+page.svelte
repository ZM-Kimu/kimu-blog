<script lang="ts">
	import { page } from '$app/state'
	import { translate } from '$lib/i18n'
	import SubpageScreen from '$lib/components/layout/SubpageScreen.svelte'
	import UpdatesPage from '$lib/features/updates/UpdatesPage.svelte'
	import SeoHead from '$lib/components/ui/SeoHead.svelte'

	const messages = $derived(page.data.i18n?.messages)
</script>

<SeoHead
	title={translate(messages, 'seo.updates.title')}
	description={translate(messages, 'seo.updates.description')}
	pathname="/updates"
/>

<SubpageScreen>
	<UpdatesPage />
</SubpageScreen>
