<script lang="ts">
	import ManagePostEditor from '$lib/features/manage/components/ManagePostEditor.svelte'
	import ManagePostList from '$lib/features/manage/components/ManagePostList.svelte'
	import ManageShell from '$lib/features/manage/components/ManageShell.svelte'

	import type {
		ManagePostDocument,
		ManagePostListItem,
		ManageSessionResponse
	} from '$lib/features/manage/types'

	type EditorMode = 'create' | 'edit'
	type CopyVariant = 'default' | 'long' | 'empty'
	type VisualState = 'idle' | 'success' | 'error' | 'loading' | 'disabled'
	const visualStates: readonly VisualState[] = ['idle', 'success', 'error', 'loading', 'disabled']

	const mockSession: ManageSessionResponse = {
		actor: {
			audience: ['debug'],
			email: 'debug@kimu.local',
			issuer: 'debug',
			name: 'Debug Operator',
			sub: 'debug-operator'
		},
		csrfToken: 'debug-csrf-token',
		repository: {
			branch: 'debug',
			name: 'kimu-blog',
			owner: 'ZM-Kimu'
		}
	}

	const baseSource = `## 当前调试目标

- 检查 manage shell 的头部密度
- 检查 editor / preview 之间的列宽关系
- 检查长文案、空态、错误态与加载态的视觉表现

![debug-cover](/images/og-default.svg)
`

	function createMockDocument(variant: CopyVariant): ManagePostDocument {
		const title =
			variant === 'long'
				? '这是一个用于调试 manage 编辑器布局与多行标题表现的超长标题样本'
				: variant === 'empty'
					? ''
					: 'Manage 调试样稿'
		const description =
			variant === 'long'
				? '这是一段更长的摘要文本，用来观察编辑器字段、预览头部以及 manage 沙盒在长文案条件下的断行、密度和节奏。'
				: variant === 'empty'
					? ''
					: '用于本地调试样式和交互状态的 mock 文稿。'

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
				category: 'Workbench',
				author: 'Kimu',
				series: 'Debug',
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
			source: variant === 'empty' ? '' : baseSource
		}
	}

	function createMockList(variant: CopyVariant): ManagePostListItem[] {
		return [
			{
				category: 'Workbench',
				date: '2026-03-28',
				description:
					variant === 'long'
						? '用于观察列表行在长摘要与长标题条件下的拥挤程度。'
						: '用于调试样式和交互状态的 mock 列表项。',
				draft: false,
				featured: true,
				format: 'svx',
				sha: 'list-sha-1',
				slug: variant === 'long' ? 'manage-debug-long' : 'manage-debug',
				title:
					variant === 'long'
						? '这是一个用于调试 manage 列表在长标题场景下表现的记录'
						: 'Manage 调试样稿',
				updated: '2026-03-28'
			},
			{
				category: 'Drafts',
				date: '2026-03-24',
				description: '草稿态、普通长度、非 featured。',
				draft: true,
				featured: false,
				format: 'md',
				sha: 'list-sha-2',
				slug: 'draft-sandbox',
				title: '草稿样本',
				updated: '2026-03-27'
			},
			{
				category: 'Archive',
				date: '2026-02-10',
				description:
					variant === 'empty'
						? '用于观察空内容文档在列表中的常规表现。'
						: '用于观察不同分类 chip 的密度。',
				draft: false,
				featured: false,
				format: 'svx',
				sha: 'list-sha-3',
				slug: 'archive-sandbox',
				title: variant === 'empty' ? '空内容样本' : '归档样本',
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
		visualState === 'success' ? '已进入本地成功态，不会写入仓库。' : ''
	)
	const debugErrorMessage = $derived(
		visualState === 'error' ? '本地错误态：用于检查 editor 提示样式。' : ''
	)
</script>

<ManageShell session={mockSession} postsHref="#debug-list" backHref="/">
	<section class="panel manage-debug-controls">
		<div class="panel-heading">
			<div>
				<p class="eyebrow">Debug Sandbox</p>
				<h2>Manage 样式调试</h2>
			</div>
		</div>

		<div class="manage-debug-controls-grid">
			<section class="manage-debug-controls-group">
				<strong>Editor Mode</strong>
				<div class="manage-debug-controls-chips">
					<button
						class:active={editorMode === 'edit'}
						type="button"
						onclick={() => (editorMode = 'edit')}
					>
						Edit
					</button>
					<button
						class:active={editorMode === 'create'}
						type="button"
						onclick={() => (editorMode = 'create')}
					>
						Create
					</button>
				</div>
			</section>

			<section class="manage-debug-controls-group">
				<strong>Copy Variant</strong>
				<div class="manage-debug-controls-chips">
					<button
						class:active={copyVariant === 'default'}
						type="button"
						onclick={() => (copyVariant = 'default')}
					>
						Default
					</button>
					<button
						class:active={copyVariant === 'long'}
						type="button"
						onclick={() => (copyVariant = 'long')}
					>
						Long
					</button>
					<button
						class:active={copyVariant === 'empty'}
						type="button"
						onclick={() => (copyVariant = 'empty')}
					>
						Empty
					</button>
				</div>
			</section>

			<section class="manage-debug-controls-group">
				<strong>Visual State</strong>
				<div class="manage-debug-controls-chips">
					{#each visualStates as state (state)}
						<button
							class:active={visualState === state}
							type="button"
							onclick={() => (visualState = state)}
						>
							{state}
						</button>
					{/each}
				</div>
			</section>

			<section class="manage-debug-controls-group">
				<strong>Preview</strong>
				<label class="manage-debug-controls-toggle">
					<input bind:checked={previewVisible} type="checkbox" />
					<span>{previewVisible ? 'Visible' : 'Hidden'}</span>
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
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		padding: 0.58rem 0.78rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: rgb(255 255 255 / 78%);
		transition:
			transform var(--ease),
			border-color var(--ease),
			background-color var(--ease);
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
