<script lang="ts">
	import ManageUpdateEditor from '$lib/features/manage/components/ManageUpdateEditor.svelte'
	let { data } = $props()
</script>

<ManageUpdateEditor csrfToken={data.session.csrfToken} mode="create" />
