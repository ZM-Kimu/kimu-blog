<script lang="ts">
	import { page } from '$app/state'
	import { goto } from '$app/navigation'
	import { resolve } from '$app/paths'
	import { onDestroy, onMount, tick } from 'svelte'

	import {
		createManagedPostRequest,
		deleteManagedPostRequest,
		fetchManagedGroups,
		fetchManagedPostList,
		ManageApiError,
		renameManagedGroupRequest,
		updateManagedPostRequest
	} from '$lib/features/manage/api'
	import {
		createEmptyManagePostFormState,
		createManagePostFormState,
		getTodayString,
		toManageWritePayload
	} from '$lib/features/manage/form'
	import { resolveManageErrorMessage } from '$lib/features/manage/copy'
	import { renderManagePreviewHtml } from '$lib/features/manage/preview'
	import type {
		ManageGroupDocument,
		ManagePostDocument,
		ManagePostFormState
	} from '$lib/features/manage/types'
	import ScrollChrome from '$lib/components/ui/ScrollChrome.svelte'
	import ManageFormatSelect from '$lib/features/manage/components/ManageFormatSelect.svelte'
	import ManageGroupSelect from '$lib/features/manage/components/ManageGroupSelect.svelte'
	import ManagePreviewPane from '$lib/features/manage/components/ManagePreviewPane.svelte'
	import { translate } from '$lib/i18n'

	type EditorMode = 'create' | 'edit'
	type EditorTab = 'information' | 'content'

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

	let sourceTextarea = $state<HTMLTextAreaElement | null>(null)
	let form = $state<ManagePostFormState>(createEmptyManagePostFormState())
	let currentSlug = $state('')
	let pendingUploads = $state<PendingUpload[]>([])
	let errorMessage = $state('')
	let statusMessage = $state('')
	let isSubmitting = $state(false)
	let activeEditorTab = $state<EditorTab>('information')
	let previewVisible = $state(true)
	let knownSlugs = $state<Set<string>>(new Set())
	let seriesItems = $state<ManageGroupDocument[]>([])
	let slugIndexLoading = $state(false)
	let slugIndexReady = $state(false)
	let titleEdited = $state(false)
	let uploadDragDepth = 0
	let isUploadDragActive = $state(false)
	let lastResetKey = $state('__boot__')
	const acceptedImageTypes = new Set([
		'image/png',
		'image/jpeg',
		'image/webp',
		'image/avif',
		'image/gif'
	])

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
		form.updated = getTodayString()
		currentSlug = post?.slug ?? ''
		errorMessage = ''
		statusMessage = ''
		activeEditorTab = 'information'
		titleEdited = false
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
	const submitLabel = $derived(
		mode === 'create' ? t('manage.editor.createSubmit') : t('manage.editor.saveChanges')
	)
	const effectiveStatusMessage = $derived(debugMode ? debugStatusMessage : statusMessage)
	const effectiveErrorMessage = $derived(debugMode ? debugErrorMessage : errorMessage)
	const effectiveSubmitting = $derived(debugMode ? debugSubmitting : isSubmitting)
	const editorDisabled = $derived(debugDisabled || effectiveSubmitting)
	const effectivePreviewVisible = $derived(previewVisible && (!debugMode || debugPreviewVisible))
	const slugStatusText = $derived(
		titleEdited && form.slug
			? slugIndexLoading
				? t('manage.editor.slugStatus.checking')
				: slugIndexReady
					? t('manage.editor.slugStatus.available')
					: ''
			: ''
	)
	const slugChecking = $derived(Boolean(titleEdited && form.slug && slugIndexLoading))
	const slugAvailable = $derived(
		Boolean(titleEdited && form.slug && slugIndexReady && !slugIndexLoading)
	)

	function hashSlugSource(value: string) {
		let hash = 2166136261

		for (const character of value) {
			hash ^= character.codePointAt(0) ?? 0
			hash = Math.imul(hash, 16777619)
		}

		return (hash >>> 0).toString(36)
	}

	function createSlugBase(title: string) {
		const source = title.trim()

		if (!source) {
			return ''
		}

		const ascii = source
			.normalize('NFKD')
			.replace(/[\u0300-\u036f]/gu, '')
			.toLowerCase()
			.replace(/[’']/gu, '')
			.replace(/&/gu, ' and ')
			.replace(/[^a-z0-9]+/gu, '-')
			.replace(/^-+|-+$/gu, '')
			.slice(0, 80)
			.replace(/-+$/gu, '')

		return ascii || `post-${hashSlugSource(source)}`
	}

	function resolveUniqueSlug(base: string) {
		if (!base || base === currentSlug || !knownSlugs.has(base)) {
			return base
		}

		let suffix = 2
		let candidate = `${base}-${suffix}`

		while (candidate !== currentSlug && knownSlugs.has(candidate)) {
			suffix += 1
			candidate = `${base}-${suffix}`
		}

		return candidate
	}

	function updateSlugFromTitle() {
		form.slug = resolveUniqueSlug(createSlugBase(form.title))
	}

	function handleTitleInput(event: Event) {
		form.title = (event.currentTarget as HTMLInputElement).value
		titleEdited = true
		updateSlugFromTitle()
	}

	async function loadKnownSlugs() {
		if (debugMode) {
			slugIndexLoading = false
			slugIndexReady = true
			return
		}

		slugIndexLoading = true

		try {
			const response = await fetchManagedPostList(fetch)
			knownSlugs = new Set(response.items.map((item) => item.slug))
			slugIndexReady = true

			if (titleEdited) {
				updateSlugFromTitle()
			}
		} catch {
			slugIndexReady = false
		} finally {
			slugIndexLoading = false
		}
	}

	async function loadSeries() {
		if (debugMode) return
		try {
			seriesItems = (await fetchManagedGroups(fetch, 'series')).items
		} catch (error) {
			errorMessage = toFriendlyError(error)
		}
	}

	async function handleRenameSeries(item: ManageGroupDocument, name: string) {
		if (!window.confirm(t('manage.groups.confirmRename', { name: item.group.name, next: name })))
			return
		try {
			const response = await renameManagedGroupRequest(
				fetch,
				csrfToken,
				'series',
				item.group.id,
				item.sha,
				name
			)
			seriesItems = seriesItems.map((entry) =>
				entry.group.id === item.group.id
					? { group: response.group, path: response.path, sha: response.sha }
					: entry
			)
		} catch (error) {
			errorMessage = toFriendlyError(error)
		}
	}

	onMount(() => {
		void loadKnownSlugs()
		void loadSeries()
	})

	function appendUploads(files: File[]) {
		const nextUploads = [...pendingUploads]

		for (const file of files.filter((candidate) => acceptedImageTypes.has(candidate.type))) {
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

	function handleUploadDragEnter(event: DragEvent) {
		event.preventDefault()

		if (editorDisabled || !event.dataTransfer?.types.includes('Files')) {
			return
		}

		uploadDragDepth += 1
		isUploadDragActive = true
	}

	function handleUploadDragOver(event: DragEvent) {
		event.preventDefault()

		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = editorDisabled ? 'none' : 'copy'
		}
	}

	function handleUploadDragLeave(event: DragEvent) {
		event.preventDefault()
		uploadDragDepth = Math.max(0, uploadDragDepth - 1)

		if (uploadDragDepth === 0) {
			isUploadDragActive = false
		}
	}

	function handleUploadDrop(event: DragEvent) {
		event.preventDefault()
		uploadDragDepth = 0
		isUploadDragActive = false

		if (editorDisabled) {
			return
		}

		const files = Array.from(event.dataTransfer?.files ?? [])

		if (files.length) {
			appendUploads(files)
		}
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

		const confirmKey =
			mode === 'create'
				? 'manage.editor.confirmSubmit.create'
				: 'manage.editor.confirmSubmit.update'

		if (!window.confirm(t(confirmKey))) {
			return
		}

		errorMessage = ''
		statusMessage = ''
		isSubmitting = true

		try {
			form.updated = getTodayString()
			const payload = toManageWritePayload(form)
			const files = pendingUploads.map((upload) => upload.file)
			const response =
				mode === 'create'
					? await createManagedPostRequest(fetch, csrfToken, payload, files)
					: await updateManagedPostRequest(fetch, csrfToken, currentSlug, payload, files)

			clearPendingUploads()
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
	class:manage-editor-preview-hidden={!effectivePreviewVisible}
	class="manage-editor"
>
	<form class="manage-editor-panel panel" onsubmit={handleSubmit}>
		<div class="manage-editor-heading">
			<div
				aria-label={t('manage.editor.tabs.ariaLabel')}
				class="manage-editor-tabs"
				data-active-index={activeEditorTab === 'information' ? 0 : 1}
				role="tablist"
			>
				<button
					aria-controls="manage-editor-information-panel"
					aria-selected={activeEditorTab === 'information'}
					class:active={activeEditorTab === 'information'}
					data-press-disabled="true"
					id="manage-editor-information-tab"
					onclick={() => (activeEditorTab = 'information')}
					role="tab"
					type="button"
				>
					{t('manage.editor.tabs.information')}
				</button>
				<button
					aria-controls="manage-editor-content-panel"
					aria-selected={activeEditorTab === 'content'}
					class:active={activeEditorTab === 'content'}
					data-press-disabled="true"
					id="manage-editor-content-tab"
					onclick={() => (activeEditorTab = 'content')}
					role="tab"
					type="button"
				>
					{t('manage.editor.tabs.content')}
				</button>
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
				<button
					aria-label={effectiveSubmitting ? t('manage.editor.submitting') : submitLabel}
					class="manage-editor-icon-button manage-editor-save"
					disabled={editorDisabled}
					title={effectiveSubmitting ? t('manage.editor.submitting') : submitLabel}
					type="submit"
				>
					<svg aria-hidden="true" viewBox="0 0 24 24">
						<path d="M5 3h11l3 3v15H5V3Z" />
						<path d="M8 3v6h8V3M8 21v-8h8v8" />
					</svg>
				</button>
				{#if mode === 'edit'}
					<button
						aria-label={t('manage.editor.delete')}
						class="manage-editor-icon-button manage-editor-danger"
						disabled={editorDisabled}
						onclick={handleDelete}
						title={t('manage.editor.delete')}
						type="button"
					>
						<svg aria-hidden="true" viewBox="0 0 24 24">
							<path d="M4 7h16M9 7V4h6v3M6.5 7l1 14h9l1-14M10 11v6M14 11v6" />
						</svg>
					</button>
				{/if}
				<button
					aria-label={effectivePreviewVisible
						? t('manage.editor.previewVisibility.hide')
						: t('manage.editor.previewVisibility.show')}
					aria-pressed={effectivePreviewVisible}
					class="manage-editor-icon-button manage-editor-preview-toggle"
					onclick={() => (previewVisible = !previewVisible)}
					title={effectivePreviewVisible
						? t('manage.editor.previewVisibility.hide')
						: t('manage.editor.previewVisibility.show')}
					type="button"
				>
					<span aria-hidden="true" class="manage-editor-preview-toggle-icon"></span>
				</button>
			</div>
		</div>

		<ScrollChrome class="manage-editor-scroll" viewportClass="manage-editor-scroll-viewport">
			{#key activeEditorTab}
				<div class="manage-editor-tab-frame" data-tab={activeEditorTab}>
					{#if activeEditorTab === 'information'}
						<div
							aria-labelledby="manage-editor-information-tab"
							class="manage-editor-tab-panel"
							id="manage-editor-information-panel"
							role="tabpanel"
						>
							<div class="manage-editor-fields">
								<label>
									<span>{t('manage.editor.fields.title')}</span>
									<input
										disabled={editorDisabled}
										oninput={handleTitleInput}
										required
										type="text"
										value={form.title}
									/>
								</label>

								<label>
									<span>{t('manage.editor.fields.slug')}</span>
									<div class="manage-editor-input-status-wrap">
										<input
											aria-describedby="manage-editor-slug-status"
											disabled={editorDisabled}
											readonly
											required
											type="text"
											value={form.slug}
										/>
										{#if slugChecking}
											<span
												aria-hidden="true"
												class="manage-editor-slug-indicator"
												data-state="checking"
											></span>
										{:else if slugAvailable}
											<span
												aria-hidden="true"
												class="manage-editor-slug-indicator"
												data-state="available"
											>
												<svg viewBox="0 0 24 24"><path d="m5 12.5 4.2 4.2L19 7" /></svg>
											</span>
										{/if}
									</div>
									<span
										aria-live="polite"
										class="manage-editor-visually-hidden"
										id="manage-editor-slug-status">{slugStatusText}</span
									>
								</label>

								<label class="manage-editor-field-wide">
									<span>{t('manage.editor.fields.description')}</span>
									<textarea
										bind:value={form.description}
										class="manage-editor-description"
										disabled={editorDisabled}
										required
										rows="3"
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

								<div class="manage-editor-field">
									<span>{t('manage.editor.fields.series')}</span>
									<ManageGroupSelect
										bind:value={form.seriesId}
										bind:newName={form.seriesName}
										createLabel={t('manage.groups.createSeries')}
										disabled={editorDisabled}
										items={seriesItems}
										label={t('manage.editor.fields.series')}
										noneLabel={t('manage.groups.none')}
										onrename={handleRenameSeries}
										renameLabel={t('manage.groups.rename')}
									/>
								</div>

								<label>
									<span>{t('manage.editor.fields.readingTime')}</span>
									<input
										bind:value={form.readingTime}
										disabled={editorDisabled}
										placeholder={t('manage.editor.placeholders.readingTime')}
										type="text"
									/>
								</label>

								<div class="manage-editor-field">
									<span>{t('manage.editor.fields.format')}</span>
									<ManageFormatSelect
										bind:value={form.format}
										disabled={editorDisabled}
										label={t('manage.editor.fields.format')}
									/>
								</div>

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
						</div>
					{:else}
						<div
							aria-labelledby="manage-editor-content-tab"
							class="manage-editor-tab-panel manage-editor-content-panel"
							id="manage-editor-content-panel"
							role="tabpanel"
						>
							<section class="manage-editor-uploads">
								<div class="panel-heading">
									<h2>{t('manage.editor.uploads.title')}</h2>
								</div>

								<label
									class:manage-editor-upload-picker-active={isUploadDragActive}
									class="manage-editor-upload-picker"
									ondragenter={handleUploadDragEnter}
									ondragleave={handleUploadDragLeave}
									ondragover={handleUploadDragOver}
									ondrop={handleUploadDrop}
								>
									<input
										accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
										aria-label={t('manage.editor.uploads.pickFiles')}
										disabled={editorDisabled}
										multiple
										onchange={handleFileSelection}
										type="file"
									/>
									<i aria-hidden="true">+</i>
									<strong>{t('manage.editor.uploads.dropTitle')}</strong>
									<span>{t('manage.editor.uploads.dropDescription')}</span>
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
						</div>
					{/if}
				</div>
			{/key}
		</ScrollChrome>
	</form>

	{#if effectivePreviewVisible}
		<ManagePreviewPane emptyLabel={t('manage.preview.empty')} html={previewHtml} />
	{/if}
</section>

<style>
	.manage-editor {
		display: grid;
		grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.8fr);
		gap: 1rem;
		align-items: stretch;
		height: 100%;
		min-height: 0;
		cursor: inherit;
	}

	.manage-editor :where(button, input, textarea, label) {
		cursor: inherit;
	}

	.manage-editor input::-webkit-calendar-picker-indicator {
		cursor: inherit;
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
		grid-template-rows: auto minmax(0, 1fr);
		gap: 1rem;
		height: 100%;
		min-height: 0;
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

	.manage-editor-toolbar {
		justify-content: flex-end;
	}

	.manage-editor-icon-button {
		display: inline-grid;
		place-items: center;
		width: 3rem;
		height: 3rem;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: 50%;
		appearance: none;
		background: rgb(255 255 255 / 72%);
		color: var(--ink);
	}

	.manage-editor-icon-button svg {
		width: 1.22rem;
		height: 1.22rem;
		fill: none;
		stroke: currentcolor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.8;
	}

	.manage-editor-preview-toggle-icon {
		width: 1.25rem;
		height: 1.25rem;
		background: currentcolor;
		mask: url('/icons/topbar/collapse.png') center / contain no-repeat;
	}

	.manage-editor-preview-toggle[aria-pressed='false'] .manage-editor-preview-toggle-icon {
		mask-image: url('/icons/topbar/expand.png');
	}

	.manage-editor-icon-button:disabled {
		opacity: 0.46;
	}

	.manage-editor-save {
		border-color: transparent;
		background: linear-gradient(145deg, #57bdf4, #557bf3);
		box-shadow: 0 12px 26px rgb(72 116 231 / 18%);
		color: white;
	}

	.manage-editor-preview-toggle[aria-pressed='true'] {
		border-color: rgb(79 120 255 / 24%);
		background: rgb(79 120 255 / 10%);
		color: #4169b3;
	}

	.manage-editor-tabs {
		position: relative;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.35rem;
		width: min(20rem, 100%);
		padding: 0.32rem;
		border: 1px solid var(--line);
		border-radius: 18px;
		background: rgb(235 244 255 / 56%);
	}

	.manage-editor-tabs::before {
		content: '';
		position: absolute;
		top: 0.32rem;
		bottom: 0.32rem;
		left: 0.32rem;
		width: calc((100% - 0.99rem) / 2);
		border-radius: 13px;
		background: rgb(255 255 255 / 88%);
		box-shadow: 0 6px 18px rgb(31 92 153 / 9%);
		transition: transform var(--motion-manage-active-indicator-duration)
			var(--motion-shared-easing-standard);
	}

	.manage-editor-tabs[data-active-index='1']::before {
		transform: translateX(calc(100% + 0.35rem));
	}

	.manage-editor-tabs button {
		position: relative;
		z-index: 1;
		min-height: 2.7rem;
		padding: 0.4rem 0.8rem;
		border: 0;
		border-radius: 13px;
		background: transparent;
		color: var(--ink-soft);
		font: inherit;
	}

	.manage-editor-tabs button.active {
		color: var(--ink);
	}

	.manage-editor-tab-frame {
		min-height: 100%;
		animation: manage-editor-tab-enter var(--motion-manage-tab-panel-enter-duration)
			var(--motion-shared-easing-standard) both;
	}

	.manage-editor-tab-panel {
		display: grid;
		gap: 1rem;
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
	.manage-editor-field,
	.manage-editor-source {
		display: grid;
		gap: 0.35rem;
	}

	:where(
		.manage-editor-fields label > span,
		.manage-editor-field > span,
		.manage-editor-source > span
	) {
		font-family: var(--font-mono);
		font-size: 0.74rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}

	.manage-editor-fields input,
	.manage-editor-fields textarea,
	.manage-editor-source textarea {
		padding: 0.82rem 0.92rem;
		border: 1px solid var(--line);
		border-radius: 18px;
		background: rgb(255 255 255 / 78%);
		color: var(--ink);
	}

	.manage-editor-fields input {
		height: 3.15rem;
		padding-block: 0;
	}

	.manage-editor-fields textarea {
		resize: none;
	}

	.manage-editor-fields input[readonly] {
		background: rgb(240 246 253 / 78%);
	}

	.manage-editor-input-status-wrap {
		position: relative;
	}

	.manage-editor-input-status-wrap input {
		width: 100%;
		padding-inline-end: 3rem;
	}

	.manage-editor-slug-indicator {
		position: absolute;
		top: 50%;
		right: 1rem;
		display: grid;
		place-items: center;
		width: 1.35rem;
		height: 1.35rem;
		border-radius: 50%;
		transform: translateY(-50%);
	}

	.manage-editor-slug-indicator[data-state='checking'] {
		border: 2px solid rgb(79 120 255 / 20%);
		border-top-color: rgb(79 120 255 / 62%);
	}

	.manage-editor-slug-indicator[data-state='available'] {
		background: rgb(11 184 135 / 12%);
		color: #087458;
	}

	.manage-editor-slug-indicator svg {
		width: 0.9rem;
		height: 0.9rem;
		fill: none;
		stroke: currentcolor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 2.4;
	}

	.manage-editor-visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
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

	.manage-editor-uploads .panel-heading {
		margin-bottom: 0;
	}

	.manage-editor-uploads .panel-heading h2 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.25rem;
	}

	.manage-editor-upload-picker {
		position: relative;
		display: grid;
		place-items: center;
		gap: 0.38rem;
		min-height: 9.5rem;
		padding: 1.35rem;
		border: 1px dashed rgb(79 120 255 / 28%);
		border-radius: 20px;
		background:
			radial-gradient(circle at 50% 0%, rgb(79 120 255 / 9%), transparent 62%),
			rgb(255 255 255 / 72%);
		text-align: center;
		cursor: inherit;
		transition:
			border-color var(--motion-shared-ease-standard),
			background-color var(--motion-shared-ease-standard),
			box-shadow var(--motion-shared-ease-standard);
	}

	.manage-editor-upload-picker:focus-within,
	.manage-editor-upload-picker-active {
		border-color: rgb(79 120 255 / 52%);
		background-color: rgb(241 247 255 / 92%);
		box-shadow: 0 0 0 4px rgb(79 120 255 / 8%);
	}

	.manage-editor-upload-picker input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		cursor: inherit;
	}

	.manage-editor-upload-picker i {
		display: grid;
		place-items: center;
		width: 2.55rem;
		height: 2.55rem;
		border: 1px solid rgb(79 120 255 / 18%);
		border-radius: 50%;
		background: rgb(79 120 255 / 10%);
		color: #557fd0;
		font-size: 1.4rem;
		font-style: normal;
		line-height: 1;
	}

	.manage-editor-upload-picker strong {
		font-family: var(--font-display);
		font-size: 1rem;
	}

	.manage-editor-upload-picker span {
		max-width: 34rem;
		color: var(--ink-faint);
		font-size: 0.82rem;
		line-height: 1.5;
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

	.manage-editor-source textarea {
		min-height: 36rem;
		font-family: var(--font-mono);
		line-height: 1.7;
		resize: none;
	}

	.manage-editor-danger {
		border-color: rgb(231 91 79 / 24%);
		background: rgb(255 255 255 / 76%);
		color: #9b3129;
	}

	@keyframes manage-editor-tab-enter {
		from {
			opacity: 0;
			transform: translateX(var(--motion-manage-tab-panel-enter-offset-x));
		}

		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@media (width <= 1180px) {
		.manage-editor {
			grid-template-columns: 1fr;
			height: auto;
		}

		.manage-editor-panel {
			height: auto;
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
