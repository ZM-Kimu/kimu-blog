<script lang="ts">
	import { goto } from '$app/navigation'
	import { resolve } from '$app/paths'
	import { page } from '$app/state'
	import {
		createManagedRecordRequest,
		deleteManagedRecordRequest,
		ManageApiError,
		updateManagedRecordRequest
	} from '$lib/features/manage/api'
	import { resolveManageErrorMessage } from '$lib/features/manage/copy'
	import { createRecordId, getTodayString } from '$lib/features/manage/form'
	import type {
		ManageFavoriteDocument,
		ManageFavoriteWritePayload
	} from '$lib/features/manage/types'
	import { translate } from '$lib/i18n'
	import type { FavoriteKind } from '$lib/types/info-flow'
	import ManageRecordForm from './ManageRecordForm.svelte'
	import ManageRecordSelect from './ManageRecordSelect.svelte'

	type EditorMode = 'create' | 'edit'

	let {
		csrfToken,
		mode,
		initialRecord = null
	}: {
		csrfToken: string
		mode: EditorMode
		initialRecord?: ManageFavoriteDocument | null
	} = $props()

	function createForm(record: ManageFavoriteDocument | null) {
		return {
			added: record?.entry.added ?? getTodayString(),
			collection: record?.entry.collection ?? 'general',
			description: record?.entry.description ?? '',
			href: record?.entry.href ?? '',
			id: record?.entry.id ?? '',
			kind: record?.entry.kind ?? ('article' as FavoriteKind),
			sourceLabel: record?.entry.sourceLabel ?? '',
			title: record?.entry.title ?? ''
		}
	}

	let form = $state(createForm(null))
	let currentId = $state('')
	let expectedSha = $state<string | undefined>()
	let idWasEdited = $state(false)
	let lastResetKey = $state('')
	let isSubmitting = $state(false)
	let statusMessage = $state('')
	let errorMessage = $state('')
	const messages = $derived(page.data.i18n?.messages)
	const t = (key: string, params?: Record<string, string | number>) =>
		translate(messages, key, params)
	const kindOptions = $derived(
		(['article', 'tool', 'reference', 'site'] as const).map((value) => ({
			value,
			label: t(`favorites.kind.${value}`)
		}))
	)

	$effect(() => {
		const resetKey = initialRecord?.sha ?? '__new__'
		if (resetKey === lastResetKey) return

		form = createForm(initialRecord)
		currentId = initialRecord?.entry.id ?? ''
		expectedSha = initialRecord?.sha
		idWasEdited = Boolean(initialRecord)
		lastResetKey = resetKey
	})

	function handleTitleInput(event: Event) {
		form.title = (event.currentTarget as HTMLInputElement).value
		if (!idWasEdited) form.id = createRecordId(form.title)
	}

	function toPayload(): ManageFavoriteWritePayload {
		return {
			added: form.added,
			collection: form.collection.trim(),
			description: form.description.trim(),
			expectedSha,
			href: form.href.trim(),
			id: form.id.trim(),
			kind: form.kind,
			sourceLabel: form.sourceLabel.trim(),
			title: form.title.trim()
		}
	}

	function friendlyError(cause: unknown) {
		return cause instanceof ManageApiError
			? resolveManageErrorMessage(messages, cause.code, cause.rawMessage)
			: resolveManageErrorMessage(messages, 'manage_request_failed')
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault()
		if (!window.confirm(t(`manage.records.common.confirm.${mode}`))) return
		isSubmitting = true
		errorMessage = ''
		statusMessage = ''

		try {
			const response =
				mode === 'create'
					? await createManagedRecordRequest(fetch, csrfToken, 'favorites', toPayload())
					: await updateManagedRecordRequest(fetch, csrfToken, 'favorites', currentId, toPayload())
			expectedSha = response.sha
			currentId = response.id

			if (mode === 'create' || response.id !== initialRecord?.entry.id) {
				await goto(resolve(`/manage/favorites/${response.id}`))
				return
			}

			statusMessage = t('manage.records.common.committed', {
				sha: response.commitSha.slice(0, 7)
			})
		} catch (cause) {
			errorMessage = friendlyError(cause)
		} finally {
			isSubmitting = false
		}
	}

	async function handleDelete() {
		if (!expectedSha || !currentId) return
		if (!window.confirm(t('manage.records.common.confirm.delete', { title: form.title }))) return
		isSubmitting = true
		errorMessage = ''
		try {
			await deleteManagedRecordRequest(fetch, csrfToken, 'favorites', currentId, expectedSha)
			await goto(resolve('/manage/favorites'))
		} catch (cause) {
			errorMessage = friendlyError(cause)
		} finally {
			isSubmitting = false
		}
	}
</script>

<ManageRecordForm
	canDelete={mode === 'edit'}
	{errorMessage}
	{isSubmitting}
	{statusMessage}
	ondelete={handleDelete}
	onsubmit={handleSubmit}
>
	<div class="manage-record-fields">
		<label class="wide">
			<span>{t('manage.records.fields.title')}</span>
			<input maxlength="160" oninput={handleTitleInput} required value={form.title} />
		</label>
		<label>
			<span>{t('manage.records.fields.id')}</span>
			<input
				bind:value={form.id}
				maxlength="96"
				oninput={() => (idWasEdited = true)}
				pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
				required
			/>
		</label>
		<label>
			<span>{t('manage.records.fields.added')}</span>
			<input bind:value={form.added} required type="date" />
		</label>
		<label>
			<span>{t('manage.records.fields.kind')}</span>
			<ManageRecordSelect
				bind:value={form.kind}
				label={t('manage.records.fields.kind')}
				options={kindOptions}
			/>
		</label>
		<label>
			<span>{t('manage.records.fields.collection')}</span>
			<input bind:value={form.collection} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required />
		</label>
		<label class="wide">
			<span>{t('manage.records.fields.description')}</span>
			<textarea bind:value={form.description} maxlength="800" required></textarea>
		</label>
		<label>
			<span>{t('manage.records.fields.sourceLabel')}</span>
			<input bind:value={form.sourceLabel} maxlength="96" required />
		</label>
		<label>
			<span>{t('manage.records.fields.href')}</span>
			<input bind:value={form.href} placeholder={t('manage.records.placeholders.href')} required />
		</label>
	</div>
</ManageRecordForm>
