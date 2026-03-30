<script lang="ts">
	import SubpageScreen from '$lib/components/layout/SubpageScreen.svelte'
	import UpdatesPage from '$lib/features/updates/UpdatesPage.svelte'
	import SeoHead from '$lib/components/ui/SeoHead.svelte'
</script>

<SeoHead title="动态" description="Kimu Blog 的动态模块占位页。" pathname="/updates" />

<SubpageScreen>
	<UpdatesPage />
</SubpageScreen>
