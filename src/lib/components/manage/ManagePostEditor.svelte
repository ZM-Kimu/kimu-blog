<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onDestroy, tick } from 'svelte';

	import {
		createManagedPostRequest,
		deleteManagedPostRequest,
		ManageApiError,
		updateManagedPostRequest
	} from '$lib/features/manage/api';
	import {
		createEmptyManagePostFormState,
		createManagePostFormState,
		toManageWritePayload
	} from '$lib/features/manage/form';
	import { renderManagePreviewHtml, resolvePreviewAssetPath } from '$lib/features/manage/preview';
	import type { ManagePostDocument, ManagePostFormState } from '$lib/features/manage/types';
	import ManagePreviewPane from '$lib/components/manage/ManagePreviewPane.svelte';

	type EditorMode = 'create' | 'edit';

	interface PendingUpload {
		file: File;
		placeholder: string;
		previewUrl: string;
	}

	let {
		csrfToken,
		initialPost = null,
		mode
	} = $props<{
		csrfToken: string;
		initialPost?: ManagePostDocument | null;
		mode: EditorMode;
	}>();

	let sourceTextarea: HTMLTextAreaElement | null = null;
	let form = $state<ManagePostFormState>(createEmptyManagePostFormState());
	let currentSlug = $state('');
	let assetPaths = $state<string[]>([]);
	let pendingUploads = $state<PendingUpload[]>([]);
	let errorMessage = $state('');
	let statusMessage = $state('');
	let isSubmitting = $state(false);
	let lastResetKey = $state('__boot__');

	function revokePendingUpload(upload: PendingUpload) {
		URL.revokeObjectURL(upload.previewUrl);
	}

	function clearPendingUploads() {
		for (const upload of pendingUploads) {
			revokePendingUpload(upload);
		}

		pendingUploads = [];
	}

	onDestroy(() => {
		clearPendingUploads();
	});

	function resetFromPost(post: ManagePostDocument | null) {
		clearPendingUploads();
		form = post ? createManagePostFormState(post) : createEmptyManagePostFormState();
		currentSlug = post?.slug ?? '';
		assetPaths = post?.assetPaths ?? [];
		errorMessage = '';
		statusMessage = '';
		lastResetKey = post?.sha ?? '__new__';
	}

	$effect(() => {
		const nextKey = initialPost?.sha ?? '__new__';

		if (nextKey !== lastResetKey) {
			resetFromPost(initialPost);
		}
	});

	const uploadMap = $derived.by(
		() => new Map(pendingUploads.map((upload) => [upload.placeholder, upload.previewUrl]))
	);
	const previewHtml = $derived.by(() => renderManagePreviewHtml(form.source, uploadMap));
	const previewCover = $derived.by(() => resolvePreviewAssetPath(form.cover, uploadMap));
	const previewTags = $derived.by(() =>
		form.tagsInput
			.split(',')
			.map((tag) => tag.trim())
			.filter(Boolean)
	);
	const previewAssetPaths = $derived.by(() => {
		const uploaded = pendingUploads.map((upload) => upload.placeholder);
		const base = form.cover ? [form.cover, ...assetPaths] : assetPaths;

		return Array.from(new Set([...base, ...uploaded]));
	});
	const submitLabel = $derived(mode === 'create' ? '创建文章' : '保存更改');

	function appendUploads(files: File[]) {
		const nextUploads = [...pendingUploads];

		for (const file of files) {
			const placeholder = `upload://${file.name}`;
			const existingIndex = nextUploads.findIndex((entry) => entry.placeholder === placeholder);

			if (existingIndex >= 0) {
				revokePendingUpload(nextUploads[existingIndex]);
				nextUploads.splice(existingIndex, 1);
			}

			nextUploads.push({
				file,
				placeholder,
				previewUrl: URL.createObjectURL(file)
			});
		}

		pendingUploads = nextUploads;

		if (!form.cover && nextUploads.length) {
			form.cover = nextUploads[0].placeholder;
		}
	}

	function handleFileSelection(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const files = Array.from(input.files ?? []);

		if (files.length) {
			appendUploads(files);
		}

		input.value = '';
	}

	function removeUpload(placeholder: string) {
		const nextUploads: PendingUpload[] = [];

		for (const upload of pendingUploads) {
			if (upload.placeholder === placeholder) {
				revokePendingUpload(upload);
				continue;
			}

			nextUploads.push(upload);
		}

		pendingUploads = nextUploads;

		if (form.cover === placeholder) {
			form.cover = '';
		}
	}

	async function insertIntoSource(snippet: string) {
		if (!sourceTextarea) {
			form.source = `${form.source}\n${snippet}`.trimStart();
			return;
		}

		const start = sourceTextarea.selectionStart;
		const end = sourceTextarea.selectionEnd;
		form.source = `${form.source.slice(0, start)}${snippet}${form.source.slice(end)}`;

		await tick();
		sourceTextarea.focus();
		sourceTextarea.selectionStart = sourceTextarea.selectionEnd = start + snippet.length;
	}

	function useUploadAsCover(placeholder: string) {
		form.cover = placeholder;
	}

	async function insertUploadIntoSource(placeholder: string) {
		await insertIntoSource(`\n\n![image](${placeholder})\n`);
	}

	function toFriendlyError(error: unknown) {
		if (!(error instanceof ManageApiError)) {
			return error instanceof Error ? error.message : '保存失败，请稍后重试。';
		}

		if (error.code === 'sha_conflict') {
			return '仓库中的文章已经变化，请刷新当前页面后重新编辑。';
		}

		return error.message;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		errorMessage = '';
		statusMessage = '';
		isSubmitting = true;

		try {
			const payload = toManageWritePayload(form);
			const files = pendingUploads.map((upload) => upload.file);
			const response =
				mode === 'create'
					? await createManagedPostRequest(fetch, csrfToken, payload, files)
					: await updateManagedPostRequest(fetch, csrfToken, currentSlug, payload, files);

			clearPendingUploads();
			assetPaths = response.assetPaths;
			form.expectedSha = response.sha;
			currentSlug = response.slug;

			if (mode === 'create' || response.slug !== initialPost?.slug) {
				await goto(resolve(`/manage/posts/${response.slug}`));
				return;
			}

			statusMessage = `已提交 ${response.commitSha.slice(0, 7)}，最新内容已同步到仓库。`;
		} catch (error) {
			errorMessage = toFriendlyError(error);
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDelete() {
		if (mode !== 'edit' || !form.expectedSha || !currentSlug) {
			return;
		}

		if (!window.confirm(`确认删除文章 ${currentSlug}？这会直接提交到仓库。`)) {
			return;
		}

		errorMessage = '';
		statusMessage = '';
		isSubmitting = true;

		try {
			await deleteManagedPostRequest(fetch, csrfToken, currentSlug, form.expectedSha);
			clearPendingUploads();
			await goto(resolve('/manage/posts'));
		} catch (error) {
			errorMessage = toFriendlyError(error);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<section class="manage-editor">
	<form class="manage-editor__panel panel" onsubmit={handleSubmit}>
		<div class="manage-editor__heading">
			<div>
				<p class="eyebrow">Editor</p>
				<h2>{mode === 'create' ? '新建文章' : `编辑 ${currentSlug}`}</h2>
			</div>

			<div class="manage-editor__toolbar">
				{#if statusMessage}
					<p class="manage-editor__status manage-editor__status--success">{statusMessage}</p>
				{/if}
				{#if errorMessage}
					<p class="manage-editor__status manage-editor__status--error">{errorMessage}</p>
				{/if}
				<button class="button-primary" disabled={isSubmitting} type="submit">
					{isSubmitting ? '提交中…' : submitLabel}
				</button>
				{#if mode === 'edit'}
					<button
						class="button-secondary manage-editor__danger"
						disabled={isSubmitting}
						onclick={handleDelete}
						type="button"
					>
						删除
					</button>
				{/if}
			</div>
		</div>

		<div class="manage-editor__fields">
			<label>
				<span>标题</span>
				<input bind:value={form.title} required type="text" />
			</label>

			<label>
				<span>Slug</span>
				<input bind:value={form.slug} required type="text" />
			</label>

			<label class="manage-editor__field-wide">
				<span>摘要</span>
				<textarea bind:value={form.description} required rows="3"></textarea>
			</label>

			<label>
				<span>发布日期</span>
				<input bind:value={form.date} required type="date" />
			</label>

			<label>
				<span>更新日期</span>
				<input bind:value={form.updated} required type="date" />
			</label>

			<label>
				<span>分类</span>
				<input bind:value={form.category} placeholder="Engineering / Notes" type="text" />
			</label>

			<label>
				<span>作者</span>
				<input bind:value={form.author} type="text" />
			</label>

			<label>
				<span>Series</span>
				<input bind:value={form.series} type="text" />
			</label>

			<label>
				<span>Reading Time</span>
				<input bind:value={form.readingTime} placeholder="6 min" type="text" />
			</label>

			<label>
				<span>Canonical</span>
				<input bind:value={form.canonical} placeholder="https://..." type="url" />
			</label>

			<label>
				<span>格式</span>
				<select bind:value={form.format}>
					<option value="svx">svx</option>
					<option value="md">md</option>
				</select>
			</label>

			<label class="manage-editor__field-wide">
				<span>Tags</span>
				<input bind:value={form.tagsInput} placeholder="svelte, cloudflare, devlog" type="text" />
			</label>

			<label class="manage-editor__field-wide">
				<span>Cover</span>
				<input bind:value={form.cover} placeholder="/images/... or upload://file.png" type="text" />
			</label>
		</div>

		<div class="manage-editor__toggles">
			<label><input bind:checked={form.draft} type="checkbox" /> Draft</label>
			<label><input bind:checked={form.featured} type="checkbox" /> Featured</label>
			<label><input bind:checked={form.toc} type="checkbox" /> TOC</label>
		</div>

		<section class="manage-editor__uploads">
			<div class="panel-heading">
				<div>
					<p class="eyebrow">Uploads</p>
					<h2>图片与占位符</h2>
				</div>
			</div>

			<label class="manage-editor__upload-picker">
				<span>选择图片</span>
				<input
					accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
					multiple
					onchange={handleFileSelection}
					type="file"
				/>
			</label>

			{#if pendingUploads.length}
				<div class="manage-editor__upload-list">
					{#each pendingUploads as upload (upload.placeholder)}
						<div class="manage-editor__upload-card">
							<img alt="" src={upload.previewUrl} />
							<div>
								<strong>{upload.file.name}</strong>
								<code>{upload.placeholder}</code>
							</div>
							<div class="manage-editor__upload-actions">
								<button onclick={() => useUploadAsCover(upload.placeholder)} type="button"
									>设为 cover</button
								>
								<button onclick={() => insertUploadIntoSource(upload.placeholder)} type="button">
									插入正文
								</button>
								<button onclick={() => removeUpload(upload.placeholder)} type="button">移除</button>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="manage-editor__upload-empty">
					上传图片后会生成 `upload://filename` 占位符，并在右侧预览中即时替换。
				</p>
			{/if}
		</section>

		<label class="manage-editor__source">
			<span>Source</span>
			<textarea bind:this={sourceTextarea} bind:value={form.source} required rows="24"></textarea>
		</label>
	</form>

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
</section>

<style>
	.manage-editor {
		display: grid;
		grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.8fr);
		gap: 1rem;
		align-items: start;
	}

	.manage-editor__panel {
		display: grid;
		gap: 1rem;
		padding: 1.2rem;
	}

	.manage-editor__heading,
	.manage-editor__toolbar,
	.manage-editor__toggles {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		justify-content: space-between;
		align-items: center;
	}

	.manage-editor__heading h2 {
		margin: 0.12rem 0 0;
		font-family: var(--font-display);
		font-size: 2rem;
		letter-spacing: -0.05em;
	}

	.manage-editor__toolbar {
		justify-content: flex-end;
	}

	.manage-editor__status {
		margin: 0;
		padding: 0.65rem 0.85rem;
		border-radius: 16px;
		font-size: 0.92rem;
	}

	.manage-editor__status--success {
		background: rgba(11, 184, 135, 0.12);
		color: #05674b;
	}

	.manage-editor__status--error {
		background: rgba(231, 91, 79, 0.12);
		color: #9b3129;
	}

	.manage-editor__fields {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.85rem;
	}

	.manage-editor__fields label,
	.manage-editor__source,
	.manage-editor__upload-picker {
		display: grid;
		gap: 0.35rem;
	}

	.manage-editor__fields span,
	.manage-editor__source span,
	.manage-editor__upload-picker span {
		font-family: var(--font-mono);
		font-size: 0.74rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}

	.manage-editor__fields input,
	.manage-editor__fields textarea,
	.manage-editor__fields select,
	.manage-editor__source textarea {
		padding: 0.82rem 0.92rem;
		border: 1px solid var(--line);
		border-radius: 18px;
		background: rgba(255, 255, 255, 0.78);
		color: var(--ink);
	}

	.manage-editor__field-wide {
		grid-column: 1 / -1;
	}

	.manage-editor__toggles {
		justify-content: flex-start;
	}

	.manage-editor__toggles label {
		display: inline-flex;
		gap: 0.45rem;
		align-items: center;
		padding: 0.58rem 0.76rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.7);
	}

	.manage-editor__uploads {
		display: grid;
		gap: 0.8rem;
		padding: 1rem;
		border: 1px solid var(--line);
		border-radius: 24px;
		background: rgba(255, 255, 255, 0.54);
	}

	.manage-editor__upload-picker input {
		padding: 0.8rem;
		border: 1px dashed rgba(79, 120, 255, 0.28);
		border-radius: 18px;
		background: rgba(255, 255, 255, 0.82);
	}

	.manage-editor__upload-list {
		display: grid;
		gap: 0.65rem;
	}

	.manage-editor__upload-card {
		display: grid;
		grid-template-columns: 5.5rem minmax(0, 1fr) auto;
		gap: 0.8rem;
		align-items: center;
		padding: 0.8rem;
		border: 1px solid var(--line);
		border-radius: 20px;
		background: rgba(255, 255, 255, 0.82);
	}

	.manage-editor__upload-card img {
		width: 100%;
		height: 4.4rem;
		border-radius: 16px;
		object-fit: cover;
	}

	.manage-editor__upload-card strong {
		display: block;
		margin-bottom: 0.2rem;
		font-family: var(--font-display);
	}

	.manage-editor__upload-card code {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--ink-soft);
	}

	.manage-editor__upload-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		justify-content: flex-end;
	}

	.manage-editor__upload-actions button {
		padding: 0.52rem 0.72rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.82);
	}

	.manage-editor__upload-empty {
		margin: 0;
		color: var(--ink-soft);
	}

	.manage-editor__source textarea {
		min-height: 36rem;
		font-family: var(--font-mono);
		line-height: 1.7;
		resize: vertical;
	}

	.manage-editor__danger {
		border-color: rgba(231, 91, 79, 0.24);
		color: #9b3129;
	}

	@media (max-width: 1180px) {
		.manage-editor {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 720px) {
		.manage-editor__fields {
			grid-template-columns: 1fr;
		}

		.manage-editor__upload-card {
			grid-template-columns: 1fr;
		}

		.manage-editor__upload-actions {
			justify-content: flex-start;
		}
	}
</style>
