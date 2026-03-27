<script lang="ts">
	let { assetPaths, category, cover, date, description, html, slug, tags, title, updated } =
		$props<{
			assetPaths: string[];
			category: string;
			cover: string;
			date: string;
			description: string;
			html: string;
			slug: string;
			tags: string[];
			title: string;
			updated: string;
		}>();
</script>

<section class="manage-preview panel">
	<div class="manage-preview__intro">
		<div>
			<p class="eyebrow">Live Preview</p>
			<h2>正文预览</h2>
		</div>
		<p>Markdown / GFM / 图片按正文样式即时渲染；mdsvex 组件与 import 会显示占位块。</p>
	</div>

	<div class="manage-preview__viewport">
		<header class="manage-preview__hero">
			{#if cover}
				<div class="manage-preview__cover">
					<img alt="" src={cover} />
				</div>
			{/if}

			<div class="manage-preview__copy">
				<p class="eyebrow">Article Record</p>
				<h1>{title || 'Untitled draft'}</h1>
				<p>{description || '这里会显示摘要和导语。'}</p>
			</div>

			<div class="manage-preview__meta">
				<div>
					<span>Slug</span>
					<strong>{slug || 'pending-slug'}</strong>
				</div>
				<div>
					<span>Category</span>
					<strong>{category || '未分类'}</strong>
				</div>
				<div>
					<span>Published</span>
					<strong>{date || '---- -- --'}</strong>
				</div>
				<div>
					<span>Updated</span>
					<strong>{updated || '---- -- --'}</strong>
				</div>
			</div>
		</header>

		<div class="manage-preview__tags">
			{#if tags.length}
				{#each tags as tag (tag)}
					<span>{tag}</span>
				{/each}
			{:else}
				<span class="manage-preview__tag-placeholder">No tags yet</span>
			{/if}
		</div>

		<div class="content-prose article-prose manage-preview__content">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html html}
		</div>

		{#if assetPaths.length}
			<section class="manage-preview__assets">
				<div class="panel-heading">
					<div>
						<p class="eyebrow">Asset Index</p>
						<h2>已解析资源</h2>
					</div>
				</div>

				<div class="manage-preview__asset-list">
					{#each assetPaths as assetPath (assetPath)}
						<code>{assetPath}</code>
					{/each}
				</div>
			</section>
		{/if}
	</div>
</section>

<style>
	.manage-preview {
		display: grid;
		gap: 0.95rem;
		padding: 1.1rem;
	}

	.manage-preview__intro h2 {
		margin: 0.1rem 0 0;
		font-family: var(--font-display);
		font-size: 1.7rem;
		letter-spacing: -0.04em;
	}

	.manage-preview__intro p:last-child {
		margin: 0.4rem 0 0;
		color: var(--ink-soft);
	}

	.manage-preview__viewport {
		display: grid;
		gap: 1rem;
		border: 1px solid var(--line);
		border-radius: 24px;
		background: rgba(255, 255, 255, 0.72);
		padding: 1rem;
	}

	.manage-preview__hero {
		display: grid;
		gap: 0.9rem;
	}

	.manage-preview__cover {
		overflow: hidden;
		border-radius: 22px;
		border: 1px solid var(--line);
		background: linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(79, 120, 255, 0.08));
	}

	.manage-preview__cover img {
		width: 100%;
		aspect-ratio: 16 / 8;
		object-fit: cover;
	}

	.manage-preview__copy h1 {
		margin: 0.25rem 0 0.45rem;
		font-family: var(--font-display);
		font-size: clamp(2rem, 4vw, 3rem);
		letter-spacing: -0.06em;
		line-height: 0.98;
	}

	.manage-preview__copy p:last-child {
		margin: 0;
		color: var(--ink-soft);
		line-height: 1.75;
	}

	.manage-preview__meta {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.6rem;
	}

	.manage-preview__meta div {
		display: grid;
		gap: 0.16rem;
		padding: 0.8rem 0.9rem;
		border: 1px solid var(--line);
		border-radius: 18px;
		background: rgba(255, 255, 255, 0.66);
	}

	.manage-preview__meta span,
	.manage-preview__assets code {
		font-family: var(--font-mono);
		font-size: 0.74rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.manage-preview__meta strong {
		font-family: var(--font-display);
		font-size: 0.94rem;
	}

	.manage-preview__tags,
	.manage-preview__asset-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
	}

	.manage-preview__tags span,
	.manage-preview__asset-list code {
		padding: 0.34rem 0.58rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.8);
	}

	.manage-preview__tag-placeholder {
		color: var(--ink-faint);
	}

	.manage-preview__content {
		padding: 0;
	}

	:global(.manage-preview__content .manage-preview__placeholder) {
		display: grid;
		gap: 0.3rem;
		margin: 1rem 0;
		padding: 0.9rem 1rem;
		border: 1px dashed rgba(79, 120, 255, 0.32);
		border-radius: 20px;
		background: rgba(79, 120, 255, 0.08);
	}

	:global(.manage-preview__content .manage-preview__placeholder strong) {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	:global(.manage-preview__content .manage-preview__placeholder p) {
		margin: 0;
		color: var(--ink-soft);
	}

	@media (max-width: 900px) {
		.manage-preview__meta {
			grid-template-columns: 1fr;
		}
	}
</style>
