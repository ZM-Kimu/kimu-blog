<script lang="ts">
	import { page } from '$app/state'
	import { goto } from '$app/navigation'
	import { resolve } from '$app/paths'
	import { onDestroy, tick } from 'svelte'

	import {
		createManagedPostRequest,
		deleteManagedPostRequest,
		ManageApiError,
		updateManagedPostRequest
	} from '$lib/features/manage/api'
	import {
		createEmptyManagePostFormState,
		createManagePostFormState,
		toManageWritePayload
	} from '$lib/features/manage/form'
	import { resolveManageErrorMessage } from '$lib/features/manage/copy'
	import { renderManagePreviewHtml, resolvePreviewAssetPath } from '$lib/features/manage/preview'
	import type { ManagePostDocument, ManagePostFormState } from '$lib/features/manage/types'
	import ManagePreviewPane from '$lib/features/manage/components/ManagePreviewPane.svelte'
	import { translate } from '$lib/i18n'

	type EditorMode = 'create' | 'edit'

	interface PendingUpload {
		file: File
		placeholder: string
		previewUrl: string
	}

	let {
		csrfToken,
		initialPost = null,
		mode,
		debugMode = false,
		debugPreviewVisible = true,
		debugDisabled = false,
		debugSubmitting = false,
		debugStatusMessage = '',
		debugErrorMessage = ''
	} = $props<{
		csrfToken: string
		initialPost?: ManagePostDocument | null
		mode: EditorMode
		debugMode?: boolean
		debugPreviewVisible?: boolean
		debugDisabled?: boolean
		debugSubmitting?: boolean
		debugStatusMessage?: string
		debugErrorMessage?: string
	}>()

	let sourceTextarea: HTMLTextAreaElement | null = null
	let form = $state<ManagePostFormState>(createEmptyManagePostFormState())
	let currentSlug = $state('')
	let assetPaths = $state<string[]>([])
	let pendingUploads = $state<PendingUpload[]>([])
	let errorMessage = $state('')
	let statusMessage = $state('')
	let isSubmitting = $state(false)
	let lastResetKey = $state('__boot__')

	function revokePendingUpload(upload: PendingUpload) {
		URL.revokeObjectURL(upload.previewUrl)
	}

	function clearPendingUploads() {
		for (const upload of pendingUploads) {
			revokePendingUpload(upload)
		}

		pendingUploads = []
	}

	onDestroy(() => {
		clearPendingUploads()
	})

	function resetFromPost(post: ManagePostDocument | null) {
		clearPendingUploads()
		form = post ? createManagePostFormState(post) : createEmptyManagePostFormState()
		currentSlug = post?.slug ?? ''
		assetPaths = post?.assetPaths ?? []
		errorMessage = ''
		statusMessage = ''
		lastResetKey = post?.sha ?? '__new__'
	}

	$effect(() => {
		const nextKey = initialPost?.sha ?? '__new__'

		if (nextKey !== lastResetKey) {
			resetFromPost(initialPost)
		}
	})

	const uploadMap = $derived.by(
		() => new Map(pendingUploads.map((upload) => [upload.placeholder, upload.previewUrl]))
	)
	const messages = $derived(page.data.i18n?.messages)
	const t = (key: string, params?: Record<string, string | number>) =>
		translate(messages, key, params)
	const previewHtml = $derived.by(() =>
		renderManagePreviewHtml(form.source, uploadMap, {
			description: t('manage.preview.placeholders.description'),
			scriptBlockLabel: t('manage.preview.placeholders.scriptBlock'),
			styleBlockLabel: t('manage.preview.placeholders.styleBlock'),
			componentBlockLabel: (name: string) =>
				t('manage.preview.placeholders.componentBlock', { name })
		})
	)
	const previewCover = $derived.by(() => resolvePreviewAssetPath(form.cover, uploadMap))
	const previewTags = $derived.by(() =>
		form.tagsInput
			.split(',')
			.map((tag) => tag.trim())
			.filter(Boolean)
	)
	const previewAssetPaths = $derived.by(() => {
		const uploaded = pendingUploads.map((upload) => upload.placeholder)
		const base = form.cover ? [form.cover, ...assetPaths] : assetPaths

		return Array.from(new Set([...base, ...uploaded]))
	})
	const submitLabel = $derived(
		mode === 'create' ? t('manage.editor.createSubmit') : t('manage.editor.saveChanges')
	)
	const effectiveStatusMessage = $derived(debugMode ? debugStatusMessage : statusMessage)
	const effectiveErrorMessage = $derived(debugMode ? debugErrorMessage : errorMessage)
	const effectiveSubmitting = $derived(debugMode ? debugSubmitting : isSubmitting)
	const editorDisabled = $derived(debugDisabled || effectiveSubmitting)

	function appendUploads(files: File[]) {
		const nextUploads = [...pendingUploads]

		for (const file of files) {
			const placeholder = `upload://${file.name}`
			const existingIndex = nextUploads.findIndex((entry) => entry.placeholder === placeholder)

			if (existingIndex >= 0) {
				revokePendingUpload(nextUploads[existingIndex])
				nextUploads.splice(existingIndex, 1)
			}

			nextUploads.push({
				file,
				placeholder,
				previewUrl: URL.createObjectURL(file)
			})
		}

		pendingUploads = nextUploads

		if (!form.cover && nextUploads.length) {
			form.cover = nextUploads[0].placeholder
		}
	}

	function handleFileSelection(event: Event) {
		const input = event.currentTarget as HTMLInputElement
		const files = Array.from(input.files ?? [])

		if (files.length) {
			appendUploads(files)
		}

		input.value = ''
	}

	function removeUpload(placeholder: string) {
		const nextUploads: PendingUpload[] = []

		for (const upload of pendingUploads) {
			if (upload.placeholder === placeholder) {
				revokePendingUpload(upload)
				continue
			}

			nextUploads.push(upload)
		}

		pendingUploads = nextUploads

		if (form.cover === placeholder) {
			form.cover = ''
		}
	}

	async function insertIntoSource(snippet: string) {
		if (!sourceTextarea) {
			form.source = `${form.source}\n${snippet}`.trimStart()
			return
		}

		const start = sourceTextarea.selectionStart
		const end = sourceTextarea.selectionEnd
		form.source = `${form.source.slice(0, start)}${snippet}${form.source.slice(end)}`

		await tick()
		sourceTextarea.focus()
		sourceTextarea.selectionStart = sourceTextarea.selectionEnd = start + snippet.length
	}

	function useUploadAsCover(placeholder: string) {
		form.cover = placeholder
	}

	async function insertUploadIntoSource(placeholder: string) {
		await insertIntoSource(`\n\n![image](${placeholder})\n`)
	}

	function toFriendlyError(error: unknown) {
		if (error instanceof ManageApiError) {
			return resolveManageErrorMessage(messages, error.code, error.rawMessage)
		}

		return t('manage.editor.errors.genericSave')
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault()

		if (debugMode) {
			return
		}

		errorMessage = ''
		statusMessage = ''
		isSubmitting = true

		try {
			const payload = toManageWritePayload(form)
			const files = pendingUploads.map((upload) => upload.file)
			const response =
				mode === 'create'
					? await createManagedPostRequest(fetch, csrfToken, payload, files)
					: await updateManagedPostRequest(fetch, csrfToken, currentSlug, payload, files)

			clearPendingUploads()
			assetPaths = response.assetPaths
			form.expectedSha = response.sha
			currentSlug = response.slug

			if (mode === 'create' || response.slug !== initialPost?.slug) {
				await goto(resolve(`/manage/posts/${response.slug}`))
				return
			}

			statusMessage = t('manage.editor.statusCommitted', {
				sha: response.commitSha.slice(0, 7)
			})
		} catch (error) {
			errorMessage = toFriendlyError(error)
		} finally {
			isSubmitting = false
		}
	}

	async function handleDelete() {
		if (debugMode) {
			return
		}

		if (mode !== 'edit' || !form.expectedSha || !currentSlug) {
			return
		}

		if (!window.confirm(t('manage.editor.errors.deleteConfirm', { slug: currentSlug }))) {
			return
		}

		errorMessage = ''
		statusMessage = ''
		isSubmitting = true

		try {
			await deleteManagedPostRequest(fetch, csrfToken, currentSlug, form.expectedSha)
			clearPendingUploads()
			await goto(resolve('/manage/posts'))
		} catch (error) {
			errorMessage = toFriendlyError(error)
		} finally {
			isSubmitting = false
		}
	}
</script>

<section
	class:manage-editor-disabled={debugDisabled}
	class:manage-editor-preview-hidden={!debugPreviewVisible}
	class="manage-editor"
>
	<form class="manage-editor-panel panel" onsubmit={handleSubmit}>
		<div class="manage-editor-heading">
			<div>
				<p class="eyebrow">{t('manage.editor.eyebrow')}</p>
				<h2>
					{mode === 'create'
						? t('manage.editor.createTitle')
						: t('manage.editor.editTitle', { slug: currentSlug })}
				</h2>
			</div>

			<div class="manage-editor-toolbar">
				{#if effectiveStatusMessage}
					<p class="manage-editor-status manage-editor-status-success">
						{effectiveStatusMessage}
					</p>
				{/if}
				{#if effectiveErrorMessage}
					<p class="manage-editor-status manage-editor-status-error">{effectiveErrorMessage}</p>
				{/if}
				<button class="button-primary" disabled={editorDisabled} type="submit">
					{effectiveSubmitting ? t('manage.editor.submitting') : submitLabel}
				</button>
				{#if mode === 'edit'}
					<button
						class="button-secondary manage-editor-danger"
						disabled={editorDisabled}
						onclick={handleDelete}
						type="button"
					>
						{t('manage.editor.delete')}
					</button>
				{/if}
			</div>
		</div>

		<div class="manage-editor-fields">
			<label>
				<span>{t('manage.editor.fields.title')}</span>
				<input bind:value={form.title} disabled={editorDisabled} required type="text" />
			</label>

			<label>
				<span>{t('common.slug')}</span>
				<input bind:value={form.slug} disabled={editorDisabled} required type="text" />
			</label>

			<label class="manage-editor-field-wide">
				<span>{t('manage.editor.fields.description')}</span>
				<textarea bind:value={form.description} disabled={editorDisabled} required rows="3"
				></textarea>
			</label>

			<label>
				<span>{t('manage.editor.fields.date')}</span>
				<input bind:value={form.date} disabled={editorDisabled} required type="date" />
			</label>

			<label>
				<span>{t('manage.editor.fields.updated')}</span>
				<input bind:value={form.updated} disabled={editorDisabled} required type="date" />
			</label>

			<label>
				<span>{t('manage.editor.fields.category')}</span>
				<input
					bind:value={form.category}
					disabled={editorDisabled}
					placeholder={t('manage.editor.placeholders.category')}
					type="text"
				/>
			</label>

			<label>
				<span>{t('manage.editor.fields.author')}</span>
				<input bind:value={form.author} disabled={editorDisabled} type="text" />
			</label>

			<label>
				<span>{t('manage.editor.fields.series')}</span>
				<input bind:value={form.series} disabled={editorDisabled} type="text" />
			</label>

			<label>
				<span>{t('manage.editor.fields.readingTime')}</span>
				<input
					bind:value={form.readingTime}
					disabled={editorDisabled}
					placeholder={t('manage.editor.placeholders.readingTime')}
					type="text"
				/>
			</label>

			<label>
				<span>{t('manage.editor.fields.canonical')}</span>
				<input
					bind:value={form.canonical}
					disabled={editorDisabled}
					placeholder={t('manage.editor.placeholders.canonical')}
					type="url"
				/>
			</label>

			<label>
				<span>{t('manage.editor.fields.format')}</span>
				<select bind:value={form.format} disabled={editorDisabled}>
					<option value="svx">svx</option>
					<option value="md">md</option>
				</select>
			</label>

			<label class="manage-editor-field-wide">
				<span>{t('manage.editor.fields.tags')}</span>
				<input
					bind:value={form.tagsInput}
					disabled={editorDisabled}
					placeholder={t('manage.editor.placeholders.tags')}
					type="text"
				/>
			</label>

			<label class="manage-editor-field-wide">
				<span>{t('manage.editor.fields.cover')}</span>
				<input
					bind:value={form.cover}
					disabled={editorDisabled}
					placeholder={t('manage.editor.placeholders.cover')}
					type="text"
				/>
			</label>
		</div>

		<div class="manage-editor-toggles">
			<label
				><input bind:checked={form.draft} disabled={editorDisabled} type="checkbox" />
				{t('manage.editor.toggles.draft')}</label
			>
			<label
				><input bind:checked={form.featured} disabled={editorDisabled} type="checkbox" />
				{t('manage.editor.toggles.featured')}</label
			>
			<label
				><input bind:checked={form.toc} disabled={editorDisabled} type="checkbox" />
				{t('manage.editor.toggles.toc')}</label
			>
		</div>

		<section class="manage-editor-uploads">
			<div class="panel-heading">
				<div>
					<p class="eyebrow">{t('manage.editor.uploads.eyebrow')}</p>
					<h2>{t('manage.editor.uploads.title')}</h2>
				</div>
			</div>

			<label class="manage-editor-upload-picker">
				<span>{t('manage.editor.uploads.pickFiles')}</span>
				<input
					accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
					disabled={editorDisabled}
					multiple
					onchange={handleFileSelection}
					type="file"
				/>
			</label>

			{#if pendingUploads.length}
				<div class="manage-editor-upload-list">
					{#each pendingUploads as upload (upload.placeholder)}
						<div class="manage-editor-upload-card">
							<img alt="" src={upload.previewUrl} />
							<div>
								<strong>{upload.file.name}</strong>
								<code>{upload.placeholder}</code>
							</div>
							<div class="manage-editor-upload-actions">
								<button
									disabled={editorDisabled}
									onclick={() => useUploadAsCover(upload.placeholder)}
									type="button"
								>
									{t('manage.editor.uploads.setCover')}
								</button>
								<button
									disabled={editorDisabled}
									onclick={() => insertUploadIntoSource(upload.placeholder)}
									type="button"
								>
									{t('manage.editor.uploads.insertBody')}
								</button>
								<button
									disabled={editorDisabled}
									onclick={() => removeUpload(upload.placeholder)}
									type="button"
								>
									{t('manage.editor.uploads.remove')}
								</button>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="manage-editor-upload-empty">{t('manage.editor.uploads.empty')}</p>
			{/if}
		</section>

		<label class="manage-editor-source">
			<span>{t('manage.editor.source')}</span>
			<textarea
				bind:this={sourceTextarea}
				bind:value={form.source}
				disabled={editorDisabled}
				required
				rows="24"
			></textarea>
		</label>
	</form>

	{#if debugPreviewVisible}
		<ManagePreviewPane
			assetPaths={previewAssetPaths}
			category={form.category}
			cover={previewCover}
			date={form.date}
			description={form.description}
			html={previewHtml}
			slug={form.slug}
			tags={previewTags}
			title={form.title}
			updated={form.updated}
		/>
	{/if}
</section>

<style>
	.manage-editor {
		display: grid;
		grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.8fr);
		gap: 1rem;
		align-items: start;
	}

	.manage-editor-preview-hidden {
		grid-template-columns: 1fr;
	}

	.manage-editor-disabled {
		opacity: 0.72;
		filter: saturate(0.74);
	}

	.manage-editor-panel {
		display: grid;
		gap: 1rem;
		padding: 1.2rem;
	}

	.manage-editor-heading,
	.manage-editor-toolbar,
	.manage-editor-toggles {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		justify-content: space-between;
		align-items: center;
	}

	.manage-editor-heading h2 {
		margin: 0.12rem 0 0;
		font-family: var(--font-display);
		font-size: 2rem;
		letter-spacing: -0.05em;
	}

	.manage-editor-toolbar {
		justify-content: flex-end;
	}

	.manage-editor-status {
		margin: 0;
		padding: 0.65rem 0.85rem;
		border-radius: 16px;
		font-size: 0.92rem;
	}

	.manage-editor-status-success {
		background: rgb(11 184 135 / 12%);
		color: #05674b;
	}

	.manage-editor-status-error {
		background: rgb(231 91 79 / 12%);
		color: #9b3129;
	}

	.manage-editor-fields {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.85rem;
	}

	.manage-editor-fields label,
	.manage-editor-source,
	.manage-editor-upload-picker {
		display: grid;
		gap: 0.35rem;
	}

	.manage-editor-fields span,
	.manage-editor-source span,
	.manage-editor-upload-picker span {
		font-family: var(--font-mono);
		font-size: 0.74rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}

	.manage-editor-fields input,
	.manage-editor-fields textarea,
	.manage-editor-fields select,
	.manage-editor-source textarea {
		padding: 0.82rem 0.92rem;
		border: 1px solid var(--line);
		border-radius: 18px;
		background: rgb(255 255 255 / 78%);
		color: var(--ink);
	}

	.manage-editor-field-wide {
		grid-column: 1 / -1;
	}

	.manage-editor-toggles {
		justify-content: flex-start;
	}

	.manage-editor-toggles label {
		display: inline-flex;
		gap: 0.45rem;
		align-items: center;
		padding: 0.58rem 0.76rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: rgb(255 255 255 / 70%);
	}

	.manage-editor-uploads {
		display: grid;
		gap: 0.8rem;
		padding: 1rem;
		border: 1px solid var(--line);
		border-radius: 24px;
		background: rgb(255 255 255 / 54%);
	}

	.manage-editor-upload-picker input {
		padding: 0.8rem;
		border: 1px dashed rgb(79 120 255 / 28%);
		border-radius: 18px;
		background: rgb(255 255 255 / 82%);
	}

	.manage-editor-upload-list {
		display: grid;
		gap: 0.65rem;
	}

	.manage-editor-upload-card {
		display: grid;
		grid-template-columns: 5.5rem minmax(0, 1fr) auto;
		gap: 0.8rem;
		align-items: center;
		padding: 0.8rem;
		border: 1px solid var(--line);
		border-radius: 20px;
		background: rgb(255 255 255 / 82%);
	}

	.manage-editor-upload-card img {
		width: 100%;
		height: 4.4rem;
		border-radius: 16px;
		object-fit: cover;
	}

	.manage-editor-upload-card strong {
		display: block;
		margin-bottom: 0.2rem;
		font-family: var(--font-display);
	}

	.manage-editor-upload-card code {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--ink-soft);
	}

	.manage-editor-upload-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		justify-content: flex-end;
	}

	.manage-editor-upload-actions button {
		padding: 0.52rem 0.72rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: rgb(255 255 255 / 82%);
	}

	.manage-editor-upload-empty {
		margin: 0;
		color: var(--ink-soft);
	}

	.manage-editor-source textarea {
		min-height: 36rem;
		font-family: var(--font-mono);
		line-height: 1.7;
		resize: vertical;
	}

	.manage-editor-danger {
		border-color: rgb(231 91 79 / 24%);
		color: #9b3129;
	}

	@media (width <= 1180px) {
		.manage-editor {
			grid-template-columns: 1fr;
		}
	}

	@media (width <= 720px) {
		.manage-editor-fields {
			grid-template-columns: 1fr;
		}

		.manage-editor-upload-card {
			grid-template-columns: 1fr;
		}

		.manage-editor-upload-actions {
			justify-content: flex-start;
		}
	}
</style>
