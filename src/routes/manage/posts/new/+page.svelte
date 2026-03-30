<script lang="ts">
	import ManagePostEditor from '$lib/features/manage/components/ManagePostEditor.svelte'

	let { data } = $props()
</script>

<ManagePostEditor csrfToken={data.session.csrfToken} mode="create" />
