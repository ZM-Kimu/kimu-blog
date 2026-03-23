<script lang="ts">
	import { resolve } from '$app/paths';
	import PostCard from '$lib/components/ui/PostCard.svelte';
	import SeoHead from '$lib/components/ui/SeoHead.svelte';
	import TagChip from '$lib/components/ui/TagChip.svelte';

	let { data } = $props();
</script>

<SeoHead />

<section class="hero-panel">
	<div>
		<p class="eyebrow">Content-first SvelteKit Scaffold</p>
		<h1>为强交互内容站准备的 SvelteKit + Cloudflare Pages 起手架。</h1>
		<p class="hero-copy">
			当前版本已经打通内容 schema、文章
			prerender、标签索引与基础布局，后面可以直接往设计和业务模块上叠。
		</p>
	</div>

	<div class="hero-actions">
		<a class="button-primary" href={resolve('/blog')}>进入文章列表</a>
		<a class="button-secondary" href={resolve('/about')}>查看项目说明</a>
	</div>
</section>

<section class="section-block">
	<div class="section-heading">
		<div>
			<p class="eyebrow">Latest Posts</p>
			<h2>最近更新</h2>
		</div>
		<a class="section-link" href={resolve('/blog')}>查看全部</a>
	</div>

	<div class="post-grid">
		{#each data.latestPosts as post (post.slug)}
			<PostCard {post} />
		{/each}
	</div>
</section>

<section class="section-block">
	<div class="section-heading">
		<div>
			<p class="eyebrow">Tag Index</p>
			<h2>标签入口</h2>
		</div>
	</div>

	<div class="tag-row">
		{#each data.tags as tag (tag.slug)}
			<TagChip href={`/tags/${tag.slug}`} label={`${tag.name} (${tag.count})`} />
		{/each}
	</div>
</section>
