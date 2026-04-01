<script lang="ts">
	import { page } from '$app/state'
	import { resolve } from '$app/paths'
	import { translate } from '$lib/i18n'
	import type { BlogPost } from '$lib/types/content'
	import { formatDate } from '$lib/utils/date'
	import TagChip from './TagChip.svelte'

	interface Props {
		post: BlogPost
	}

	let { post }: Props = $props()
	const messages = $derived(page.data.i18n?.messages)
	const locale = $derived(page.data.i18n?.locale)
</script>

<article class="post-card">
	<div class="post-card-hud">
		<span class="post-card-code">{post.categorySlug ? post.categorySlug.toUpperCase() : 'LOG'}</span
		>
		<span
			>{post.featured
				? translate(messages, 'common.featured')
				: translate(messages, 'common.record')}</span
		>
	</div>

	<div class="post-card-body">
		<div class="post-meta">
			<span>{formatDate(post.date, locale)}</span>
			<span>{post.category ?? translate(messages, 'common.uncategorized')}</span>
		</div>
		<h3><a href={resolve(post.permalink)}>{post.title}</a></h3>
		<p>{post.description}</p>
	</div>

	<div class="tag-row post-card-tags">
		{#each post.tags.slice(0, 3) as tag, index (post.tagSlugs[index])}
			<TagChip href={`/tags/${post.tagSlugs[index]}`} label={tag} />
		{/each}
	</div>
</article>
