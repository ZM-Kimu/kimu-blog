<script lang="ts">
	import { page } from '$app/state'
	import ManagePostEditor from '$lib/features/manage/components/ManagePostEditor.svelte'
	import ManagePostList from '$lib/features/manage/components/ManagePostList.svelte'
	import ManageShell from '$lib/features/manage/components/ManageShell.svelte'
	import { translate } from '$lib/i18n'

	import type {
		ManagePostDocument,
		ManagePostListItem,
		ManageSessionResponse
	} from '$lib/features/manage/types'

	type EditorMode = 'create' | 'edit'
	type CopyVariant = 'default' | 'long' | 'empty'
	type VisualState = 'idle' | 'success' | 'error' | 'loading' | 'disabled'
	const visualStates: readonly VisualState[] = ['idle', 'success', 'error', 'loading', 'disabled']
	const messages = $derived(page.data.i18n?.messages)
	const t = (key: string, params?: Record<string, string | number>) =>
		translate(messages, key, params)

	const mockSession = $derived.by<ManageSessionResponse>(() => ({
		actor: {
			audience: ['debug'],
			email: 'debug@kimu.local',
			issuer: 'debug',
			name: t('manage.debug.actorName'),
			sub: 'debug-operator'
		},
		csrfToken: 'debug-csrf-token',
		repository: {
			branch: 'debug',
			name: 'kimu-blog',
			owner: 'ZM-Kimu'
		}
	}))

	function createMockDocument(variant: CopyVariant): ManagePostDocument {
		const title =
			variant === 'long'
				? t('manage.debug.documents.longTitle')
				: variant === 'empty'
					? ''
					: t('manage.debug.documents.defaultTitle')
		const description =
			variant === 'long'
				? t('manage.debug.documents.longDescription')
				: variant === 'empty'
					? ''
					: t('manage.debug.documents.defaultDescription')

		return {
			assetPaths: ['/images/og-default.svg', '/images/Popup_Image_Arona.png'],
			format: 'svx',
			frontmatter: {
				title,
				description,
				date: '2026-03-28',
				updated: '2026-03-28',
				tags: variant === 'empty' ? [] : ['manage', 'debug', 'sandbox'],
				draft: false,
				cover: '/images/og-default.svg',
				slug: variant === 'long' ? 'manage-debug-long' : 'manage-debug',
				category: t('manage.debug.categories.workbench'),
				author: 'Kimu',
				series: t('manage.debug.eyebrow'),
				toc: true,
				readingTime: '6 min',
				canonical: '',
				featured: variant !== 'empty'
			},
			path: '/src/lib/content/blog/manage-debug.svx',
			sha:
				variant === 'long'
					? 'debug-sha-long'
					: variant === 'empty'
						? 'debug-sha-empty'
						: 'debug-sha',
			slug: variant === 'long' ? 'manage-debug-long' : 'manage-debug',
			source: variant === 'empty' ? '' : t('manage.debug.baseSource')
		}
	}

	function createMockList(variant: CopyVariant): ManagePostListItem[] {
		return [
			{
				category: t('manage.debug.categories.workbench'),
				date: '2026-03-28',
				description:
					variant === 'long'
						? t('manage.debug.documents.longDescription')
						: t('manage.debug.documents.defaultDescription'),
				draft: false,
				featured: true,
				format: 'svx',
				sha: 'list-sha-1',
				slug: variant === 'long' ? 'manage-debug-long' : 'manage-debug',
				title:
					variant === 'long'
						? t('manage.debug.documents.longTitle')
						: t('manage.debug.documents.defaultTitle'),
				updated: '2026-03-28'
			},
			{
				category: t('manage.debug.categories.drafts'),
				date: '2026-03-24',
				description: t('manage.debug.documents.draftDescription'),
				draft: true,
				featured: false,
				format: 'md',
				sha: 'list-sha-2',
				slug: 'draft-sandbox',
				title: t('manage.debug.documents.draftTitle'),
				updated: '2026-03-27'
			},
			{
				category: t('manage.debug.categories.archive'),
				date: '2026-02-10',
				description:
					variant === 'empty'
						? t('manage.debug.documents.emptyDescription')
						: t('manage.debug.documents.archiveDescription'),
				draft: false,
				featured: false,
				format: 'svx',
				sha: 'list-sha-3',
				slug: 'archive-sandbox',
				title:
					variant === 'empty'
						? t('manage.debug.documents.emptyTitle')
						: t('manage.debug.documents.archiveTitle'),
				updated: '2026-03-01'
			}
		]
	}

	let editorMode = $state<EditorMode>('edit')
	let copyVariant = $state<CopyVariant>('default')
	let visualState = $state<VisualState>('idle')
	let previewVisible = $state(true)

	const currentDocument = $derived(editorMode === 'edit' ? createMockDocument(copyVariant) : null)
	const currentList = $derived(createMockList(copyVariant))
	const debugSubmitting = $derived(visualState === 'loading')
	const debugDisabled = $derived(visualState === 'disabled')
	const debugStatusMessage = $derived(
		visualState === 'success' ? t('manage.debug.successState') : ''
	)
	const debugErrorMessage = $derived(visualState === 'error' ? t('manage.debug.errorState') : '')
</script>

<ManageShell session={mockSession} postsHref="#debug-list" backHref="/">
	<section class="panel manage-debug-controls">
		<div class="panel-heading">
			<div>
				<p class="eyebrow">{t('manage.debug.eyebrow')}</p>
				<h2>{t('manage.debug.title')}</h2>
			</div>
		</div>

		<div class="manage-debug-controls-grid">
			<section class="manage-debug-controls-group">
				<strong>{t('manage.debug.editorMode')}</strong>
				<div class="manage-debug-controls-chips">
					<button
						class:active={editorMode === 'edit'}
						type="button"
						onclick={() => (editorMode = 'edit')}
					>
						{t('manage.debug.edit')}
					</button>
					<button
						class:active={editorMode === 'create'}
						type="button"
						onclick={() => (editorMode = 'create')}
					>
						{t('manage.debug.create')}
					</button>
				</div>
			</section>

			<section class="manage-debug-controls-group">
				<strong>{t('manage.debug.copyVariant')}</strong>
				<div class="manage-debug-controls-chips">
					<button
						class:active={copyVariant === 'default'}
						type="button"
						onclick={() => (copyVariant = 'default')}
					>
						{t('manage.debug.default')}
					</button>
					<button
						class:active={copyVariant === 'long'}
						type="button"
						onclick={() => (copyVariant = 'long')}
					>
						{t('manage.debug.long')}
					</button>
					<button
						class:active={copyVariant === 'empty'}
						type="button"
						onclick={() => (copyVariant = 'empty')}
					>
						{t('manage.debug.empty')}
					</button>
				</div>
			</section>

			<section class="manage-debug-controls-group">
				<strong>{t('manage.debug.visualState')}</strong>
				<div class="manage-debug-controls-chips">
					{#each visualStates as state (state)}
						<button
							class:active={visualState === state}
							type="button"
							onclick={() => (visualState = state)}
						>
							{t(`manage.debug.states.${state}`)}
						</button>
					{/each}
				</div>
			</section>

			<section class="manage-debug-controls-group">
				<strong>{t('manage.debug.preview')}</strong>
				<label class="manage-debug-controls-toggle">
					<input bind:checked={previewVisible} type="checkbox" />
					<span>{previewVisible ? t('manage.debug.visible') : t('manage.debug.hidden')}</span>
				</label>
			</section>
		</div>
	</section>

	<div class="manage-debug-grid">
		<ManagePostList
			items={currentList}
			createHref="#debug-create"
			resolveItemHref={(slug) => `#debug-${slug}`}
		/>

		<ManagePostEditor
			csrfToken={mockSession.csrfToken}
			initialPost={currentDocument}
			mode={editorMode}
			debugMode
			debugPreviewVisible={previewVisible}
			{debugDisabled}
			{debugSubmitting}
			{debugStatusMessage}
			{debugErrorMessage}
		/>
	</div>
</ManageShell>

<style>
	.manage-debug-controls,
	.manage-debug-grid {
		width: min(1500px, calc(100vw - 2rem));
		margin: 0 auto;
	}

	.manage-debug-controls {
		display: grid;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.manage-debug-controls-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.9rem;
	}

	.manage-debug-controls-group {
		display: grid;
		gap: 0.6rem;
		padding: 0.9rem 1rem;
		border: 1px solid var(--line);
		border-radius: 22px;
		background: rgb(255 255 255 / 64%);
	}

	.manage-debug-controls-group strong {
		font-family: var(--font-display);
		font-size: 1rem;
	}

	.manage-debug-controls-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
	}

	.manage-debug-controls-chips button,
	.manage-debug-controls-toggle {
		--site-press-scale: 1;
		--site-press-translate-y: 0px;

		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		padding: 0.58rem 0.78rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: rgb(255 255 255 / 78%);
		scale: var(--site-press-scale);
		translate: 0 var(--site-press-translate-y);
		transform-origin: center;
		touch-action: manipulation;
		transition:
			transform var(--motion-shared-ease-standard),
			translate var(--motion-press-out-duration) var(--motion-shared-easing-standard),
			scale var(--motion-press-out-duration) var(--motion-shared-easing-standard),
			border-color var(--motion-shared-ease-standard),
			background-color var(--motion-shared-ease-standard);
	}

	.manage-debug-controls-chips button:active,
	.manage-debug-controls-toggle:active {
		--site-press-scale: var(--motion-press-active-scale);
		--site-press-translate-y: var(--motion-press-active-translate-y);

		transition-duration: var(--motion-press-in-duration);
	}

	.manage-debug-controls-chips button.active {
		border-color: rgb(79 120 255 / 28%);
		background: rgb(233 242 255 / 96%);
	}

	.manage-debug-controls-chips button:hover,
	.manage-debug-controls-toggle:hover {
		transform: translateY(-1px);
		border-color: rgb(79 120 255 / 24%);
	}

	.manage-debug-controls-toggle input {
		accent-color: #4f78ff;
	}

	.manage-debug-grid {
		display: grid;
		gap: 1rem;
	}

	@media (width <= 1180px) {
		.manage-debug-controls-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (width <= 760px) {
		.manage-debug-controls-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
