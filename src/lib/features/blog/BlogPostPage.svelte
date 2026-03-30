<script module lang="ts">
	import type { Component } from 'svelte'

	type BlogContentModule = {
		default: Component<Record<string, never>>
	}

	const modules = import.meta.glob('/src/lib/content/blog/*.{md,svx}', {
		eager: true
	}) as Record<string, BlogContentModule>
</script>

<script lang="ts">
	import { page } from '$app/state'
	import { resolve } from '$app/paths'
	import { translate } from '$lib/i18n'
	import { siteConfig } from '$lib/config/site'
	import TagChip from './components/TagChip.svelte'
	import { formatDate } from '$lib/utils/date'
	import { error } from '@sveltejs/kit'

	let { data } = $props()
	const messages = $derived(page.data.i18n?.messages)
	const locale = $derived(page.data.i18n?.locale)
	const t = (key: string, params?: Record<string, string | number>) =>
		translate(messages, key, params)

	const Content = $derived.by(() => {
		const contentModule = modules[data.post.path]

		if (!contentModule) {
			throw error(404, 'post_module_missing')
		}

		return contentModule.default
	})
</script>

<article class="dossier-shell">
	<header class="panel dossier-hero">
		<div class="dossier-hero-top">
			<p class="eyebrow">{t('blog.post.heroEyebrow')}</p>
			<a class="button-secondary dossier-hero-back" href={resolve('/blog/archive')}>
				{t('blog.post.backArchive')}
			</a>
		</div>

		<div class="dossier-hero-header">
			<div>
				<h1>{data.post.title}</h1>
				<p class="post-description">{data.post.description}</p>
			</div>

			<div class="dossier-hero-stats">
				<div class="dossier-stat">
					<span>{t('common.status')}</span>
					<strong
						>{data.post.featured
							? t('blog.post.statusFeatured')
							: t('blog.post.statusPublished')}</strong
					>
				</div>
				<div class="dossier-stat">
					<span>{t('common.category')}</span>
					<strong>{data.post.category ?? t('common.uncategorized')}</strong>
				</div>
				<div class="dossier-stat">
					<span>{t('common.slug')}</span>
					<strong>{data.post.slug}</strong>
				</div>
			</div>
		</div>

		<div class="post-meta">
			<span>{t('common.publishedAt', { date: formatDate(data.post.date, locale) })}</span>
			<span>{t('common.updatedAt', { date: formatDate(data.post.updated, locale) })}</span>
			<span>{t('common.author')} {data.post.author ?? siteConfig.author}</span>
		</div>
	</header>

	<div class="dossier-layout">
		<div class="panel dossier-main">
			<div class="content-prose article-prose">
				<Content />
			</div>
		</div>

		<aside class="dossier-side">
			<section class="panel dossier-side-panel">
				<div class="panel-heading">
					<div>
						<p class="eyebrow">{t('blog.post.metadataEyebrow')}</p>
						<h2>{t('blog.post.metadataTitle')}</h2>
					</div>
				</div>

				<div class="meta-stack">
					<div>
						<span>{t('common.category')}</span>
						<strong>{data.post.category ?? t('common.uncategorized')}</strong>
					</div>
					<div>
						<span
							>{t('common.tagCount', {
								count: String(data.post.tags.length).padStart(2, '0')
							})}</span
						>
						<strong>{String(data.post.tags.length).padStart(2, '0')}</strong>
					</div>
					<div>
						<span>{t('common.renderMode')}</span>
						<strong>{t('common.prerender')}</strong>
					</div>
				</div>
			</section>

			<section class="panel dossier-side-panel">
				<div class="panel-heading">
					<div>
						<p class="eyebrow">{t('blog.post.tagsEyebrow')}</p>
						<h2>{t('blog.post.tagsTitle')}</h2>
					</div>
				</div>

				<div class="tag-row">
					{#each data.post.tags as tag, index (data.post.tagSlugs[index])}
						<TagChip href={`/tags/${data.post.tagSlugs[index]}`} label={tag} />
					{/each}
				</div>
			</section>

			<section class="panel dossier-side-panel">
				<div class="panel-heading">
					<div>
						<p class="eyebrow">{t('blog.post.relatedEyebrow')}</p>
						<h2>{t('blog.post.relatedTitle')}</h2>
					</div>
				</div>

				<div class="related-stack">
					{#if data.relatedPosts.length}
						{#each data.relatedPosts as post (post.slug)}
							<a class="related-link" href={resolve(post.permalink)}>
								<strong>{post.title}</strong>
								<span>{post.category ?? t('common.uncategorized')}</span>
							</a>
						{/each}
					{:else}
						<div class="related-link related-link-empty">
							<strong>{t('blog.post.relatedEmptyTitle')}</strong>
							<span>{t('blog.post.relatedEmptyDescription')}</span>
						</div>
					{/if}
				</div>
			</section>
		</aside>
	</div>
</article>
