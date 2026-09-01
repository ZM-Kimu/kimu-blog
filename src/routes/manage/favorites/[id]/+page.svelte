<script lang="ts">
	import { page } from '$app/state'
	import { fetchManagedRecord, ManageApiError } from '$lib/features/manage/api'
	import ManageFavoriteEditor from '$lib/features/manage/components/ManageFavoriteEditor.svelte'
	import { resolveManageErrorMessage } from '$lib/features/manage/copy'
	import type { ManageFavoriteDocument } from '$lib/features/manage/types'
	import { translate } from '$lib/i18n'

	let { data } = $props()
	let record = $state<ManageFavoriteDocument | null>(null)
	let loading = $state(false)
	let errorMessage = $state('')
	let activeId = $state('')
	const messages = $derived(page.data.i18n?.messages)
	const t = (key: string) => translate(messages, key)

	async function loadRecord(id: string) {
		loading = true
		errorMessage = ''
		try {
			record = await fetchManagedRecord(fetch, 'favorites', id)
		} catch (cause) {
			record = null
			errorMessage =
				cause instanceof ManageApiError
					? resolveManageErrorMessage(messages, cause.code, cause.rawMessage)
					: resolveManageErrorMessage(messages, 'record_load_failed')
		} finally {
			loading = false
		}
	}

	$effect(() => {
		const id = page.params.id
		if (id && id !== activeId) {
			activeId = id
			void loadRecord(id)
		}
	})
</script>

{#if loading}
	<div aria-busy="true" aria-live="polite" class="manage-record-page-state panel">
		{t('manage.records.common.loading')}
	</div>
{:else if errorMessage}
	<div class="manage-record-page-state panel">
		<span>{errorMessage}</span>
		<button data-press-disabled="true" onclick={() => loadRecord(activeId)} type="button">
			{t('manage.records.common.retry')}
		</button>
	</div>
{:else if record}
	<ManageFavoriteEditor csrfToken={data.session.csrfToken} initialRecord={record} mode="edit" />
{/if}

<style>
	.manage-record-page-state {
		display: grid;
		gap: 0.65rem;
		align-content: center;
		justify-items: start;
		min-height: 6rem;
		color: var(--ink-soft);
	}

	button {
		min-height: 2.6rem;
		padding: 0 0.9rem;
		border: 1px solid var(--line);
		border-radius: 14px;
		background: rgb(255 255 255 / 68%);
		color: var(--ink);
		cursor: inherit;
	}
</style>
