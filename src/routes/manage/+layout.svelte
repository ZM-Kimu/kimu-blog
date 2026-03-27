<script lang="ts">
	import ManageShell from '$lib/features/manage/components/ManageShell.svelte'

	let { children, data } = $props()
</script>

<ManageShell session={data.session}>
	{@render children()}
</ManageShell>
