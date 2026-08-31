<script lang="ts">
	import { onMount } from 'svelte'
	import { page } from '$app/state'

	import { fetchManagedPostList, ManageApiError } from '$lib/features/manage/api'
	import { resolveManageErrorMessage } from '$lib/features/manage/copy'
	import ManagePostList from '$lib/features/manage/components/ManagePostList.svelte'
	import type { ManagePostListItem } from '$lib/features/manage/types'

	let items = $state<ManagePostListItem[]>([])
	let isLoading = $state(true)
	let errorMessage = $state('')
	const messages = $derived(page.data.i18n?.messages)

	async function loadItems() {
		isLoading = true
		errorMessage = ''

		try {
			const response = await fetchManagedPostList(fetch)
			items = response.items
		} catch (cause) {
			items = []
			errorMessage =
				cause instanceof ManageApiError
					? resolveManageErrorMessage(messages, cause.code, cause.rawMessage)
					: resolveManageErrorMessage(messages, 'post_list_load_failed')
		} finally {
			isLoading = false
		}
	}

	onMount(() => {
		void loadItems()
	})
</script>

<ManagePostList {items} loading={isLoading} {errorMessage} onRetry={loadItems} />
