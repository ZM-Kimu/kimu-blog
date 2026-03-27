<script lang="ts">
	import ManageShell from '$lib/components/manage/ManageShell.svelte';

	let { children, data } = $props();
</script>

<ManageShell session={data.session}>
	{@render children()}
</ManageShell>
