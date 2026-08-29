<script lang="ts">
	import { page } from '$app/state'
	import { resolve } from '$app/paths'
	import { translate } from '$lib/i18n'
	import type { BlogPost } from '$lib/types/content'
	import { formatDate } from '$lib/utils/date'
	import TagChip from './TagChip.svelte'

	interface Props {
		post: BlogPost
		compact?: boolean
		showStatus?: boolean
		showCategoryMeta?: boolean
		tagLimit?: number
	}

	let {
		post,
		compact = false,
		showStatus = true,
		showCategoryMeta = true,
		tagLimit = 3
	}: Props = $props()
	const messages = $derived(page.data.i18n?.messages)
	const locale = $derived(page.data.i18n?.locale)
	const postHref = $derived(resolve(post.permalink))
</script>

<article class:post-card-compact={compact} class="post-card">
	{#if compact}
		<a class="post-card-hitbox" href={postHref} aria-label={post.title} tabindex="-1"></a>
	{/if}

	<div class="post-card-hud">
		<span class="post-card-code">{post.categorySlug ? post.categorySlug.toUpperCase() : 'LOG'}</span
		>
		{#if showStatus}
			<span
				>{post.featured
					? translate(messages, 'common.featured')
					: translate(messages, 'common.record')}</span
			>
		{/if}
	</div>

	<div class="post-card-body">
		<div class="post-meta">
			<span>{formatDate(post.date, locale)}</span>
			{#if showCategoryMeta}
				<span>{post.category ?? translate(messages, 'common.uncategorized')}</span>
			{/if}
		</div>
		<h3><a href={postHref}>{post.title}</a></h3>
		<p>{post.description}</p>
	</div>

	<div class="tag-row post-card-tags">
		{#each post.tags.slice(0, tagLimit) as tag, index (post.tagSlugs[index])}
			<TagChip href={`/tags/${post.tagSlugs[index]}`} label={tag} />
		{/each}
	</div>
</article>
