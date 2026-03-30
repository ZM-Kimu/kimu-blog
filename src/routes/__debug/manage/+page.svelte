<script lang="ts">
	import { page } from '$app/state'
	import SeoHead from '$lib/components/ui/SeoHead.svelte'
	import SubpageScreen from '$lib/components/layout/SubpageScreen.svelte'
	import DebugManageSandbox from '$lib/features/manage/DebugManageSandbox.svelte'
	import { translate } from '$lib/i18n'

	const messages = $derived(page.data.i18n?.messages)
</script>

<SeoHead
	title={translate(messages, 'seo.manageDebug.title')}
	description={translate(messages, 'seo.manageDebug.description')}
	pathname="/__debug/manage"
/>

<SubpageScreen>
	<DebugManageSandbox />
</SubpageScreen>
