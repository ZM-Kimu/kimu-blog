<script lang="ts">
	import ManagePostList from '$lib/features/manage/components/ManagePostList.svelte'

	let { data } = $props()
</script>

<ManagePostList items={data.items} />
