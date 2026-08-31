<script lang="ts">
	import SubpageScreen from '$lib/components/layout/SubpageScreen.svelte'
	import ManageShell from '$lib/features/manage/components/ManageShell.svelte'

	let { children, data } = $props()
</script>

<SubpageScreen containedScroll>
	<ManageShell session={data.session}>
		{@render children()}
	</ManageShell>
</SubpageScreen>
