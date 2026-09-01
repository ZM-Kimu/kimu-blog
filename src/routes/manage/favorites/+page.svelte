<script lang="ts">
	import { onMount } from 'svelte'
	import { page } from '$app/state'
	import { fetchManagedRecords, ManageApiError } from '$lib/features/manage/api'
	import ManageRecordList from '$lib/features/manage/components/ManageRecordList.svelte'
	import { resolveManageErrorMessage } from '$lib/features/manage/copy'
	import type { ManageFavoriteDocument } from '$lib/features/manage/types'

	let items = $state<ManageFavoriteDocument[]>([])
	let loading = $state(true)
	let errorMessage = $state('')
	const messages = $derived(page.data.i18n?.messages)

	async function loadItems() {
		loading = true
		errorMessage = ''
		try {
			items = (await fetchManagedRecords(fetch, 'favorites')).items
		} catch (cause) {
			items = []
			errorMessage =
				cause instanceof ManageApiError
					? resolveManageErrorMessage(messages, cause.code, cause.rawMessage)
					: resolveManageErrorMessage(messages, 'record_list_load_failed')
		} finally {
			loading = false
		}
	}

	onMount(() => void loadItems())
</script>

<ManageRecordList kind="favorites" {items} {loading} {errorMessage} onRetry={loadItems} />
