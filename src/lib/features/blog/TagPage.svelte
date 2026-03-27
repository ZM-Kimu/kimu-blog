<script lang="ts">
	import { resolve } from '$app/paths';
	import PostCard from './components/PostCard.svelte';
	import TagChip from './components/TagChip.svelte';

	let { data } = $props();
</script>

<section class="tag-screen">
	<section class="panel mission-intro">
		<div>
			<p class="eyebrow">Tag Filter</p>
			<h1>{data.tag.name}</h1>
			<p>当前共有 {data.tag.count} 篇文章归类在这个标签下，可作为辅助筛选入口使用。</p>
		</div>

		<div class="hero-actions">
			<TagChip label={data.tag.name} href={`/tags/${data.tag.slug}`} />
			<a class="button-secondary" href={resolve('/blog/archive')}>返回归档</a>
		</div>
	</section>

	<div class="post-grid">
		{#each data.posts as post (post.slug)}
			<PostCard {post} />
		{/each}
	</div>
</section>
