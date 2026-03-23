<script lang="ts">
	import { resolve } from '$app/paths';
	import type { BlogPost } from '$lib/types/content';
	import { formatDate } from '$lib/utils/date';
	import TagChip from './TagChip.svelte';

	interface Props {
		post: BlogPost;
	}

	let { post }: Props = $props();
</script>

<article class="post-card">
	<div class="post-meta">
		<span>{formatDate(post.date)}</span>
		<span>{post.category ?? '未分类'}</span>
	</div>

	<div>
		<h3><a href={resolve(post.permalink)}>{post.title}</a></h3>
		<p>{post.description}</p>
	</div>

	<div class="tag-row">
		{#each post.tags.slice(0, 3) as tag, index (post.tagSlugs[index])}
			<TagChip href={`/tags/${post.tagSlugs[index]}`} label={tag} />
		{/each}
	</div>
</article>
