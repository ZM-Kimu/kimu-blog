<script lang="ts">
	import { goto } from '$app/navigation'
	import { resolve } from '$app/paths'
	import { page } from '$app/state'
	import {
		createManagedRecordRequest,
		deleteManagedRecordRequest,
		fetchManagedRecords,
		ManageApiError,
		updateManagedRecordRequest
	} from '$lib/features/manage/api'
	import { resolveManageErrorMessage } from '$lib/features/manage/copy'
	import { createRecordId, getTodayString, isValidRecordId } from '$lib/features/manage/form'
	import type {
		ManageFavoriteDocument,
		ManageFavoriteWritePayload
	} from '$lib/features/manage/types'
	import { translate } from '$lib/i18n'
	import { onMount } from 'svelte'
	import ManageIdentifierField from './ManageIdentifierField.svelte'
	import ManageRecordForm from './ManageRecordForm.svelte'
	import ManageTagInput from './ManageTagInput.svelte'

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
			description: record?.entry.description ?? '',
			href: record?.entry.href ?? '',
			id: record?.entry.id ?? '',
			sourceLabel: record?.entry.sourceLabel ?? '',
			tags: record?.entry.tags ?? [],
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
	let availableTags = $state<string[]>([])
	let knownIds = $state<Set<string>>(new Set())
	let idIndexLoading = $state(true)
	let idIndexReady = $state(false)
	const messages = $derived(page.data.i18n?.messages)
	const t = (key: string, params?: Record<string, string | number>) =>
		translate(messages, key, params)

	onMount(async () => {
		idIndexLoading = true
		try {
			const response = await fetchManagedRecords(fetch, 'favorites')
			knownIds = new Set(response.items.map((item) => item.entry.id))
			idIndexReady = true
			const names: string[] = []
			for (const item of response.items) {
				for (const tag of item.entry.tags) {
					if (!names.some((name) => name.toLocaleLowerCase() === tag.toLocaleLowerCase())) {
						names.push(tag)
					}
				}
			}
			availableTags = names.sort((a, b) => a.localeCompare(b))
		} catch (cause) {
			idIndexReady = false
			errorMessage = friendlyError(cause)
		} finally {
			idIndexLoading = false
		}
	})

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

	const idIsDuplicate = $derived(Boolean(form.id && form.id !== currentId && knownIds.has(form.id)))
	const idStatus = $derived.by(() => {
		if (!form.id) return idWasEdited ? ('invalid' as const) : ('idle' as const)
		if (!isValidRecordId(form.id)) return 'invalid' as const
		if (idIndexLoading) return 'checking' as const
		if (!idIndexReady || idIsDuplicate) return 'invalid' as const
		return 'available' as const
	})
	const idStatusText = $derived(
		idStatus === 'checking'
			? t('manage.editor.slugStatus.checking')
			: idStatus === 'available'
				? t('manage.editor.slugStatus.available')
				: idStatus === 'invalid'
					? idIsDuplicate
						? t('manage.editor.slugStatus.duplicate')
						: form.id && !idIndexReady && !idIndexLoading
							? t('manage.editor.slugStatus.unavailable')
							: t('manage.editor.slugStatus.invalid')
					: ''
	)

	function toPayload(): ManageFavoriteWritePayload {
		return {
			added: form.added,
			description: form.description.trim(),
			expectedSha,
			href: form.href.trim(),
			id: form.id.trim(),
			sourceLabel: form.sourceLabel.trim(),
			tags: form.tags,
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
		if (idStatus !== 'available') {
			idWasEdited = true
			errorMessage = idStatusText || t('manage.editor.slugStatus.invalid')
			return
		}
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
		<ManageIdentifierField
			bind:value={form.id}
			fieldId="manage-favorite-id"
			label={t('manage.records.fields.id')}
			oninput={() => (idWasEdited = true)}
			status={idStatus}
			statusText={idStatusText}
		/>
		<label>
			<span>{t('manage.records.fields.added')}</span>
			<input bind:value={form.added} required type="date" />
		</label>
		<div class="manage-record-field wide">
			<span>{t('manage.records.fields.tags')}</span>
			<ManageTagInput
				available={availableTags}
				bind:value={form.tags}
				label={t('manage.records.fields.tags')}
				placeholder={t('manage.records.placeholders.favoriteTags')}
			/>
		</div>
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
