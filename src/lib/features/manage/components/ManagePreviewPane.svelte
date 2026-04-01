<script lang="ts">
	import { page } from '$app/state'
	import { translate } from '$lib/i18n'

	let { assetPaths, category, cover, date, description, html, slug, tags, title, updated } =
		$props<{
			assetPaths: string[]
			category: string
			cover: string
			date: string
			description: string
			html: string
			slug: string
			tags: string[]
			title: string
			updated: string
		}>()

	const messages = $derived(page.data.i18n?.messages)
	const t = (key: string, params?: Record<string, string | number>) =>
		translate(messages, key, params)
</script>

<section class="manage-preview panel">
	<div class="manage-preview-intro">
		<div>
			<p class="eyebrow">{t('manage.preview.eyebrow')}</p>
			<h2>{t('manage.preview.title')}</h2>
		</div>
		<p>{t('manage.preview.intro')}</p>
	</div>

	<div class="manage-preview-viewport">
		<header class="manage-preview-hero">
			{#if cover}
				<div class="manage-preview-cover">
					<img alt="" src={cover} />
				</div>
			{/if}

			<div class="manage-preview-copy">
				<p class="eyebrow">{t('manage.preview.heroEyebrow')}</p>
				<h1>{title || t('common.untitledDraft')}</h1>
				<p>{description || t('common.summaryPlaceholder')}</p>
			</div>

			<div class="manage-preview-meta">
				<div>
					<span>{t('common.slug')}</span>
					<strong>{slug || t('common.pendingSlug')}</strong>
				</div>
				<div>
					<span>{t('common.category')}</span>
					<strong>{category || t('common.uncategorized')}</strong>
				</div>
				<div>
					<span>{t('common.published')}</span>
					<strong>{date || '---- -- --'}</strong>
				</div>
				<div>
					<span>{t('common.updated')}</span>
					<strong>{updated || '---- -- --'}</strong>
				</div>
			</div>
		</header>

		<div class="manage-preview-tags">
			{#if tags.length}
				{#each tags as tag (tag)}
					<span>{tag}</span>
				{/each}
			{:else}
				<span class="manage-preview-tag-placeholder">{t('common.noTagsYet')}</span>
			{/if}
		</div>

		<div class="content-prose article-prose manage-preview-content">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html html}
		</div>

		{#if assetPaths.length}
			<section class="manage-preview-assets">
				<div class="panel-heading">
					<div>
						<p class="eyebrow">{t('manage.preview.assetsEyebrow')}</p>
						<h2>{t('manage.preview.assetsTitle')}</h2>
					</div>
				</div>

				<div class="manage-preview-asset-list">
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

	.manage-preview-intro h2 {
		margin: 0.1rem 0 0;
		font-family: var(--font-display);
		font-size: 1.7rem;
		letter-spacing: -0.04em;
	}

	.manage-preview-intro p:last-child {
		margin: 0.4rem 0 0;
		color: var(--ink-soft);
	}

	.manage-preview-viewport {
		display: grid;
		gap: 1rem;
		border: 1px solid var(--line);
		border-radius: 24px;
		background: rgb(255 255 255 / 72%);
		padding: 1rem;
	}

	.manage-preview-hero {
		display: grid;
		gap: 0.9rem;
	}

	.manage-preview-cover {
		overflow: hidden;
		border-radius: 22px;
		border: 1px solid var(--line);
		background: linear-gradient(135deg, rgb(56 189 248 / 12%), rgb(79 120 255 / 8%));
	}

	.manage-preview-cover img {
		width: 100%;
		aspect-ratio: 16 / 8;
		object-fit: cover;
	}

	.manage-preview-copy h1 {
		margin: 0.25rem 0 0.45rem;
		font-family: var(--font-display);
		font-size: clamp(2rem, 4vw, 3rem);
		letter-spacing: -0.06em;
		line-height: 0.98;
	}

	.manage-preview-copy p:last-child {
		margin: 0;
		color: var(--ink-soft);
		line-height: 1.75;
	}

	.manage-preview-meta {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.6rem;
	}

	.manage-preview-meta div {
		display: grid;
		gap: 0.16rem;
		padding: 0.8rem 0.9rem;
		border: 1px solid var(--line);
		border-radius: 18px;
		background: rgb(255 255 255 / 66%);
	}

	.manage-preview-meta span,
	.manage-preview-assets code {
		font-family: var(--font-mono);
		font-size: 0.74rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.manage-preview-meta strong {
		font-family: var(--font-display);
		font-size: 0.94rem;
	}

	.manage-preview-tags,
	.manage-preview-asset-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
	}

	.manage-preview-tags span,
	.manage-preview-asset-list code {
		padding: 0.34rem 0.58rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: rgb(255 255 255 / 80%);
	}

	.manage-preview-tag-placeholder {
		color: var(--ink-faint);
	}

	.manage-preview-content {
		padding: 0;
	}

	@media (width <= 900px) {
		.manage-preview-meta {
			grid-template-columns: 1fr;
		}
	}
</style>
