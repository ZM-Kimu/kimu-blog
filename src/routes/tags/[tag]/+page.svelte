<script lang="ts">
	import PostCard from '$lib/components/ui/PostCard.svelte';
	import SeoHead from '$lib/components/ui/SeoHead.svelte';
	import TagChip from '$lib/components/ui/TagChip.svelte';

	let { data } = $props();
</script>

<SeoHead
	title={`标签：${data.tag.name}`}
	description={`浏览标签 ${data.tag.name} 下的文章。`}
	pathname={`/tags/${data.tag.slug}`}
/>

<section class="page-intro">
	<p class="eyebrow">Tag</p>
	<h1>{data.tag.name}</h1>
	<p>当前共有 {data.tag.count} 篇文章归类在这个标签下。</p>
</section>

<div class="tag-row">
	<TagChip label={data.tag.name} href={`/tags/${data.tag.slug}`} />
</div>

<div class="post-grid">
	{#each data.posts as post (post.slug)}
		<PostCard {post} />
	{/each}
</div>
