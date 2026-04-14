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
	import { translate } from '$lib/i18n'

	import BlogPostBody from './components/BlogPostBody.svelte'
	import BlogPostHero from './components/BlogPostHero.svelte'
	import BlogPostSidebar from './components/BlogPostSidebar.svelte'

	let { data } = $props()
	const messages = $derived(page.data.i18n?.messages)
	const locale = $derived(page.data.i18n?.locale)
	const t = (key: string, params?: Record<string, string | number>) =>
		translate(messages, key, params)

	const Content = $derived(modules[data.post.path]?.default ?? null)
</script>

<article class="dossier-shell">
	<BlogPostHero
		post={data.post}
		{locale}
		statusLabel={t('blog.post.heroEyebrow')}
		featuredLabel={t('blog.post.statusFeatured')}
		publishedLabel={t('blog.post.statusPublished')}
		categoryLabel={t('common.category')}
		slugLabel={t('common.slug')}
		publishedAtLabel={t('common.publishedAt')}
		updatedAtLabel={t('common.updatedAt')}
		authorLabel={t('common.author')}
		uncategorizedLabel={t('common.uncategorized')}
		backArchiveLabel={t('blog.post.backArchive')}
	/>

	<div class="dossier-layout">
		<BlogPostBody {Content} />

		<BlogPostSidebar
			post={data.post}
			relatedPosts={data.relatedPosts}
			metadataEyebrow={t('blog.post.metadataEyebrow')}
			metadataTitle={t('blog.post.metadataTitle')}
			tagsEyebrow={t('blog.post.tagsEyebrow')}
			tagsTitle={t('blog.post.tagsTitle')}
			relatedEyebrow={t('blog.post.relatedEyebrow')}
			relatedTitle={t('blog.post.relatedTitle')}
			categoryLabel={t('common.category')}
			tagCountLabel={t('common.tagCount', {
				count: String(data.post.tags.length).padStart(2, '0')
			})}
			renderModeLabel={t('common.renderMode')}
			prerenderLabel={t('common.prerender')}
			uncategorizedLabel={t('common.uncategorized')}
			relatedEmptyTitle={t('blog.post.relatedEmptyTitle')}
			relatedEmptyDescription={t('blog.post.relatedEmptyDescription')}
		/>
	</div>
</article>
