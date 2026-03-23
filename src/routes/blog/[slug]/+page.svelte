<script module lang="ts">
	import type { Component } from 'svelte';

	type BlogContentModule = {
		default: Component<Record<string, never>>;
	};

	const modules = import.meta.glob('/src/lib/content/blog/*.{md,svx}', {
		eager: true
	}) as Record<string, BlogContentModule>;
</script>

<script lang="ts">
	import SeoHead from '$lib/components/ui/SeoHead.svelte';
	import TagChip from '$lib/components/ui/TagChip.svelte';
	import { formatDate } from '$lib/utils/date';
	import { error } from '@sveltejs/kit';

	let { data } = $props();

	const Content = $derived.by(() => {
		const contentModule = modules[data.post.path];

		if (!contentModule) {
			throw error(404, '文章模块不存在');
		}

		return contentModule.default;
	});
</script>

<SeoHead
	title={data.post.title}
	description={data.post.description}
	pathname={data.post.permalink}
	type="article"
/>

<article class="post-shell">
	<header class="post-hero">
		<p class="eyebrow">Article</p>
		<h1>{data.post.title}</h1>
		<p class="post-description">{data.post.description}</p>

		<div class="post-meta">
			<span>发布于 {formatDate(data.post.date)}</span>
			<span>更新于 {formatDate(data.post.updated)}</span>
			<span>分类 {data.post.category ?? '未分类'}</span>
		</div>

		<div class="tag-row">
			{#each data.post.tags as tag, index (data.post.tagSlugs[index])}
				<TagChip href={`/tags/${data.post.tagSlugs[index]}`} label={tag} />
			{/each}
		</div>
	</header>

	<div class="content-prose">
		<Content />
	</div>
</article>
