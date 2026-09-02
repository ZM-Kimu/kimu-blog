<script lang="ts">
	import { goto } from '$app/navigation'
	import { resolve } from '$app/paths'
	import { page } from '$app/state'
	import {
		createManagedRecordRequest,
		deleteManagedRecordRequest,
		fetchManagedGroups,
		fetchManagedRecords,
		ManageApiError,
		renameManagedGroupRequest,
		updateManagedRecordRequest
	} from '$lib/features/manage/api'
	import { resolveManageErrorMessage } from '$lib/features/manage/copy'
	import {
		createRecordId,
		getTodayString,
		isValidRecordId,
		parseCommaSeparatedValues
	} from '$lib/features/manage/form'
	import type {
		ManageGroupDocument,
		ManageUpdateDocument,
		ManageUpdateWritePayload
	} from '$lib/features/manage/types'
	import { translate } from '$lib/i18n'
	import { onMount } from 'svelte'
	import ManageGroupSelect from './ManageGroupSelect.svelte'
	import ManageIdentifierField from './ManageIdentifierField.svelte'
	import ManageRecordForm from './ManageRecordForm.svelte'

	type EditorMode = 'create' | 'edit'

	let {
		csrfToken,
		mode,
		initialRecord = null
	}: { csrfToken: string; mode: EditorMode; initialRecord?: ManageUpdateDocument | null } = $props()

	function createForm(record: ManageUpdateDocument | null) {
		return {
			date: record?.entry.date ?? getTodayString(),
			href: record?.entry.href ?? '',
			id: record?.entry.id ?? '',
			progress: record?.entry.project?.progress ?? 0,
			projectId: record?.entry.project?.id ?? '',
			projectName: '',
			summary: record?.entry.summary ?? '',
			tagsInput: record?.entry.tags.join(', ') ?? '',
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
	let projects = $state<ManageGroupDocument[]>([])
	let knownIds = $state<Set<string>>(new Set())
	let idIndexLoading = $state(true)
	let idIndexReady = $state(false)
	const messages = $derived(page.data.i18n?.messages)
	const t = (key: string, params?: Record<string, string | number>) =>
		translate(messages, key, params)

	onMount(() => {
		void loadProjects()
		void loadKnownIds()
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

	async function loadProjects() {
		try {
			projects = (await fetchManagedGroups(fetch, 'projects')).items
		} catch (cause) {
			errorMessage = friendlyError(cause)
		}
	}

	async function loadKnownIds() {
		idIndexLoading = true
		try {
			const response = await fetchManagedRecords(fetch, 'updates')
			knownIds = new Set(response.items.map((item) => item.entry.id))
			idIndexReady = true
		} catch (cause) {
			idIndexReady = false
			errorMessage = friendlyError(cause)
		} finally {
			idIndexLoading = false
		}
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

	function toPayload(): ManageUpdateWritePayload {
		return {
			date: form.date,
			expectedSha,
			href: form.href.trim() || undefined,
			id: form.id.trim(),
			project: form.projectId
				? { id: form.projectId, progress: Math.round(Number(form.progress)) }
				: undefined,
			projectName: form.projectName.trim() || undefined,
			summary: form.summary.trim(),
			tags: parseCommaSeparatedValues(form.tagsInput),
			title: form.title.trim()
		}
	}

	async function handleRenameProject(item: ManageGroupDocument, name: string) {
		if (!window.confirm(t('manage.groups.confirmRename', { name: item.group.name, next: name })))
			return
		try {
			const response = await renameManagedGroupRequest(
				fetch,
				csrfToken,
				'projects',
				item.group.id,
				item.sha,
				name
			)
			projects = projects.map((entry) =>
				entry.group.id === item.group.id
					? { group: response.group, path: response.path, sha: response.sha }
					: entry
			)
		} catch (cause) {
			errorMessage = friendlyError(cause)
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
					? await createManagedRecordRequest(fetch, csrfToken, 'updates', toPayload())
					: await updateManagedRecordRequest(fetch, csrfToken, 'updates', currentId, toPayload())
			expectedSha = response.sha
			currentId = response.id

			if (mode === 'create' || response.id !== initialRecord?.entry.id) {
				await goto(resolve(`/manage/updates/${response.id}`))
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
			await deleteManagedRecordRequest(fetch, csrfToken, 'updates', currentId, expectedSha)
			await goto(resolve('/manage/updates'))
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
			fieldId="manage-update-id"
			label={t('manage.records.fields.id')}
			oninput={() => (idWasEdited = true)}
			status={idStatus}
			statusText={idStatusText}
		/>
		<label>
			<span>{t('manage.records.fields.date')}</span>
			<input bind:value={form.date} required type="date" />
		</label>
		<div class="manage-record-field">
			<span>{t('manage.records.fields.project')}</span>
			<ManageGroupSelect
				bind:value={form.projectId}
				bind:newName={form.projectName}
				createLabel={t('manage.groups.createProject')}
				items={projects}
				label={t('manage.records.fields.project')}
				noneLabel={t('manage.groups.none')}
				onrename={handleRenameProject}
				renameCancelLabel={t('manage.groups.renameCancel')}
				renameLabel={t('manage.groups.rename')}
				renameSaveLabel={t('manage.groups.renameSave')}
			/>
		</div>
		{#if form.projectId}
			<label>
				<span>{t('manage.records.fields.progress')}</span>
				<input bind:value={form.progress} max="100" min="0" required type="number" />
			</label>
		{/if}
		<label class="wide">
			<span>{t('manage.records.fields.summary')}</span>
			<textarea bind:value={form.summary} maxlength="800" required></textarea>
		</label>
		<label class="wide">
			<span>{t('manage.records.fields.tags')}</span>
			<input bind:value={form.tagsInput} placeholder={t('manage.records.placeholders.tags')} />
		</label>
		<label class="wide">
			<span>{t('manage.records.fields.href')}</span>
			<input bind:value={form.href} placeholder={t('manage.records.placeholders.hrefOptional')} />
		</label>
	</div>
</ManageRecordForm>
