<script lang="ts">
	import { page } from '$app/state'
	import { fetchManagedPost, ManageApiError } from '$lib/features/manage/api'
	import { resolveManageErrorMessage } from '$lib/features/manage/copy'
	import ManagePostEditor from '$lib/features/manage/components/ManagePostEditor.svelte'
	import type { ManagePostDocument } from '$lib/features/manage/types'
	import { translate } from '$lib/i18n'

	let { data } = $props()
	let post = $state<ManagePostDocument | null>(null)
	let isLoading = $state(false)
	let errorMessage = $state('')
	let activeSlug = $state('')
	const messages = $derived(page.data.i18n?.messages)
	const t = (key: string) => translate(messages, key)

	async function loadPost(slug: string) {
		isLoading = true
		errorMessage = ''

		try {
			post = await fetchManagedPost(fetch, slug)
		} catch (cause) {
			post = null
			errorMessage =
				cause instanceof ManageApiError
					? resolveManageErrorMessage(messages, cause.code, cause.rawMessage)
					: resolveManageErrorMessage(messages, 'post_load_failed')
		} finally {
			isLoading = false
		}
	}

	$effect(() => {
		const slug = page.params.slug
		if (!slug || slug === activeSlug) {
			return
		}

		activeSlug = slug
		void loadPost(slug)
	})
</script>

{#if isLoading}
	<section class="manage-state panel">
		<p class="eyebrow">{t('manage.editor.eyebrow')}</p>
		<h2>{t('manage.editor.loadingTitle')}</h2>
		<p>{t('manage.editor.loadingDescription')}</p>
	</section>
{:else if errorMessage}
	<section class="manage-state panel">
		<p class="eyebrow">{t('manage.editor.eyebrow')}</p>
		<h2>{t('manage.editor.errorTitle')}</h2>
		<p>{errorMessage}</p>
		<button
			class="button-secondary"
			type="button"
			onclick={() => activeSlug && loadPost(activeSlug)}
		>
			{t('manage.editor.retry')}
		</button>
	</section>
{:else if post}
	<ManagePostEditor csrfToken={data.session.csrfToken} initialPost={post} mode="edit" />
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
