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
	import { resolve } from '$app/paths';
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

<article class="dossier-shell">
	<header class="panel dossier-hero">
		<div class="dossier-hero__top">
			<p class="eyebrow">Dossier / Article Record</p>
			<a class="button-secondary dossier-hero__back" href={resolve('/blog/archive')}>返回归档</a>
		</div>

		<div class="dossier-hero__header">
			<div>
				<h1>{data.post.title}</h1>
				<p class="post-description">{data.post.description}</p>
			</div>

			<div class="dossier-hero__stats">
				<div class="dossier-stat">
					<span>Status</span>
					<strong>{data.post.featured ? 'Featured' : 'Published'}</strong>
				</div>
				<div class="dossier-stat">
					<span>Category</span>
					<strong>{data.post.category ?? '未分类'}</strong>
				</div>
				<div class="dossier-stat">
					<span>Slug</span>
					<strong>{data.post.slug}</strong>
				</div>
			</div>
		</div>

		<div class="post-meta">
			<span>发布于 {formatDate(data.post.date)}</span>
			<span>更新于 {formatDate(data.post.updated)}</span>
			<span>作者 {data.post.author ?? 'Kimu'}</span>
		</div>
	</header>

	<div class="dossier-layout">
		<div class="panel dossier-main">
			<div class="content-prose article-prose">
				<Content />
			</div>
		</div>

		<aside class="dossier-side">
			<section class="panel dossier-side__panel">
				<div class="panel-heading">
					<div>
						<p class="eyebrow">Metadata</p>
						<h2>文章情报</h2>
					</div>
				</div>

				<div class="meta-stack">
					<div>
						<span>分类</span>
						<strong>{data.post.category ?? '未分类'}</strong>
					</div>
					<div>
						<span>标签数</span>
						<strong>{String(data.post.tags.length).padStart(2, '0')}</strong>
					</div>
					<div>
						<span>渲染模式</span>
						<strong>Prerender</strong>
					</div>
				</div>
			</section>

			<section class="panel dossier-side__panel">
				<div class="panel-heading">
					<div>
						<p class="eyebrow">Tag Matrix</p>
						<h2>标签入口</h2>
					</div>
				</div>

				<div class="tag-row">
					{#each data.post.tags as tag, index (data.post.tagSlugs[index])}
						<TagChip href={`/tags/${data.post.tagSlugs[index]}`} label={tag} />
					{/each}
				</div>
			</section>

			<section class="panel dossier-side__panel">
				<div class="panel-heading">
					<div>
						<p class="eyebrow">Related Output</p>
						<h2>相关记录</h2>
					</div>
				</div>

				<div class="related-stack">
					{#if data.relatedPosts.length}
						{#each data.relatedPosts as post (post.slug)}
							<a class="related-link" href={resolve(post.permalink)}>
								<strong>{post.title}</strong>
								<span>{post.category ?? '未分类'}</span>
							</a>
						{/each}
					{:else}
						<div class="related-link related-link--empty">
							<strong>Waiting for more records</strong>
							<span>后续有更多文章后，这里会显示相关推荐。</span>
						</div>
					{/if}
				</div>
			</section>
		</aside>
	</div>
</article>
