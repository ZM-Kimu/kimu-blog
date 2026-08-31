<script lang="ts">
	import SubpageScreen from '$lib/components/layout/SubpageScreen.svelte'
	import ManageShell from '$lib/features/manage/components/ManageShell.svelte'

	let { children } = $props()
</script>

<SubpageScreen containedScroll>
	<ManageShell>
		{@render children()}
	</ManageShell>
</SubpageScreen>
