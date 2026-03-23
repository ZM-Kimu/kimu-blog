<script lang="ts">
	import PostCard from '$lib/components/ui/PostCard.svelte';
	import SeoHead from '$lib/components/ui/SeoHead.svelte';

	let { data } = $props();
</script>

<SeoHead
	title="文章列表"
	description="浏览 Kimu Blog 当前已经接入内容系统的文章列表。"
	pathname="/blog"
/>

<section class="page-intro">
	<p class="eyebrow">Archive</p>
	<h1>文章列表</h1>
	<p>这里展示当前内容源中所有已发布文章，详情页按 `entries()` + prerender 生成。</p>
</section>

<div class="post-grid">
	{#each data.posts as post (post.slug)}
		<PostCard {post} />
	{/each}
</div>
