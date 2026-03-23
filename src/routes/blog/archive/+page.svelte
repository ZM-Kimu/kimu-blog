<script lang="ts">
	import { resolve } from '$app/paths';
	import SeoHead from '$lib/components/ui/SeoHead.svelte';
	import TagChip from '$lib/components/ui/TagChip.svelte';
	import { formatDate } from '$lib/utils/date';

	let { data } = $props();
</script>

<SeoHead
	title="完整归档"
	description="按分类与年份浏览 Kimu Blog 的全部文章记录。"
	pathname="/blog/archive"
/>

<section class="archive-screen">
	<section class="panel archive-intro">
		<div>
			<p class="eyebrow">Archive</p>
			<h1>完整归档</h1>
			<p>分类界面负责入口与选择，这里负责高效率浏览全部文章记录。</p>
		</div>

		<div class="hero-actions">
			<a class="button-primary" href={resolve('/blog')}>返回分类界面</a>
			<strong class="metric-pill">{String(data.totalPosts).padStart(2, '0')} total</strong>
		</div>
	</section>

	<section class="archive-layout">
		<div class="archive-layout__main">
			{#each data.categoryGroups as group (group.category.slug)}
				<section class="panel archive-group" id={`category-${group.category.slug}`}>
					<div class="panel-heading">
						<div>
							<p class="eyebrow">Category</p>
							<h2>{group.category.name}</h2>
						</div>
						<strong class="metric-pill">{String(group.category.count).padStart(2, '0')} logs</strong
						>
					</div>

					<div class="archive-list">
						{#if group.posts.length}
							{#each group.posts as post (post.slug)}
								<a class="archive-row" href={resolve(post.permalink)}>
									<div>
										<p class="archive-row__date">{formatDate(post.date)}</p>
										<h3>{post.title}</h3>
										<p>{post.description}</p>
									</div>
									<div class="archive-row__meta">
										<span>{post.category ?? '未分类'}</span>
										<div class="tag-row">
											{#each post.tags.slice(0, 2) as tag, index (post.tagSlugs[index])}
												<TagChip href={`/tags/${post.tagSlugs[index]}`} label={tag} />
											{/each}
										</div>
									</div>
								</a>
							{/each}
						{:else}
							<div class="archive-row archive-row--empty">
								<div>
									<p class="archive-row__date">No Records</p>
									<h3>等待内容接入</h3>
									<p>这个分类已经预留，但当前还没有正式文章。</p>
								</div>
							</div>
						{/if}
					</div>
				</section>
			{/each}
		</div>

		<aside class="panel archive-layout__side">
			<div class="panel-heading">
				<div>
					<p class="eyebrow">Year Index</p>
					<h2>按年份浏览</h2>
				</div>
			</div>

			<div class="year-stack">
				{#each data.yearGroups as group (group.year)}
					<section class="year-card">
						<div class="year-card__head">
							<strong>{group.year}</strong>
							<span>{String(group.posts.length).padStart(2, '0')}</span>
						</div>
						<ul>
							{#each group.posts as post (post.slug)}
								<li><a href={resolve(post.permalink)}>{post.title}</a></li>
							{/each}
						</ul>
					</section>
				{/each}
			</div>
		</aside>
	</section>
</section>
