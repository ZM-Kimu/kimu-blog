<script lang="ts">
	import ManagePostEditor from '$lib/components/manage/ManagePostEditor.svelte';

	let { data } = $props();
</script>

<ManagePostEditor csrfToken={data.session.csrfToken} initialPost={data.post} mode="edit" />
