<script lang="ts">
	import ManageFavoriteEditor from '$lib/features/manage/components/ManageFavoriteEditor.svelte'
	let { data } = $props()
</script>

<ManageFavoriteEditor csrfToken={data.session.csrfToken} mode="create" />
