<script lang="ts">
	import ManagePostList from '$lib/components/manage/ManagePostList.svelte';

	let { data } = $props();
</script>

<ManagePostList items={data.items} />
