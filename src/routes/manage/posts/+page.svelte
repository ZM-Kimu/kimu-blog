<script lang="ts">
	import { onMount } from 'svelte'
	import { page } from '$app/state'

	import { fetchManagedPostList, ManageApiError } from '$lib/features/manage/api'
	import { resolveManageErrorMessage } from '$lib/features/manage/copy'
	import ManagePostList from '$lib/features/manage/components/ManagePostList.svelte'
	import type { ManagePostListItem } from '$lib/features/manage/types'
	import { translate } from '$lib/i18n'

	let items = $state<ManagePostListItem[]>([])
	let isLoading = $state(true)
	let errorMessage = $state('')
	const messages = $derived(page.data.i18n?.messages)
	const t = (key: string) => translate(messages, key)

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

{#if isLoading}
	<section class="manage-state panel">
		<p class="eyebrow">{t('manage.list.eyebrow')}</p>
		<h2>{t('manage.list.loadingTitle')}</h2>
		<p>{t('manage.list.loadingDescription')}</p>
	</section>
{:else if errorMessage}
	<section class="manage-state panel">
		<p class="eyebrow">{t('manage.list.eyebrow')}</p>
		<h2>{t('manage.list.errorTitle')}</h2>
		<p>{errorMessage}</p>
		<button class="button-secondary" type="button" onclick={loadItems}>
			{t('manage.list.retry')}
		</button>
	</section>
{:else}
	<ManagePostList {items} />
{/if}

<style>
	.manage-state {
		display: grid;
		gap: 0.55rem;
		padding: 1.2rem;
	}

	.manage-state h2,
	.manage-state p {
		margin: 0;
	}

	.manage-state h2 {
		font-family: var(--font-display);
		font-size: clamp(1.65rem, 3vw, 2.3rem);
		letter-spacing: -0.04em;
	}

	.manage-state .button-secondary {
		width: fit-content;
		margin-top: 0.2rem;
	}
</style>
