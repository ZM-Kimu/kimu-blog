<script lang="ts">
	import { page } from '$app/state'
	import { resolve } from '$app/paths'
	import { missionCatalog } from '$lib/features/blog/config'
	import { translate } from '$lib/i18n'
	import TagChip from './components/TagChip.svelte'
	import { formatDate } from '$lib/utils/date'

	let { data } = $props()
	const messages = $derived(page.data.i18n?.messages)
	const locale = $derived(page.data.i18n?.locale)
	const t = (key: string, params?: Record<string, string | number>) =>
		translate(messages, key, params)

	function resolveArchiveCategoryName(name: string, slug: string) {
		const mission = missionCatalog.find((entry) => entry.slug === slug)

		return mission ? t(`home.missions.${mission.id}.title`) : name
	}
</script>

<section class="archive-screen">
	<section class="panel archive-intro">
		<div>
			<p class="eyebrow">{t('blog.archive.introEyebrow')}</p>
			<h1>{t('blog.archive.introTitle')}</h1>
			<p>{t('blog.archive.introDescription')}</p>
		</div>

		<div class="hero-actions">
			<a class="button-primary" href={resolve('/blog')}>{t('blog.archive.backToBlog')}</a>
			<strong class="metric-pill">
				{t('common.totalRecords', { count: String(data.totalPosts).padStart(2, '0') })}
			</strong>
		</div>
	</section>

	<section class="archive-layout">
		<div class="archive-layout-main">
			{#each data.categoryGroups as group (group.category.slug)}
				<section class="panel archive-group" id={`category-${group.category.slug}`}>
					<div class="panel-heading">
						<div>
							<p class="eyebrow">{t('blog.archive.categoryEyebrow')}</p>
							<h2>{resolveArchiveCategoryName(group.category.name, group.category.slug)}</h2>
						</div>
						<strong class="metric-pill">
							{t('common.logs', { count: String(group.category.count).padStart(2, '0') })}
						</strong>
					</div>

					<div class="archive-list">
						{#if group.posts.length}
							{#each group.posts as post (post.slug)}
								<a class="archive-row" href={resolve(post.permalink)}>
									<div>
										<p class="archive-row-date">{formatDate(post.date, locale)}</p>
										<h3>{post.title}</h3>
										<p>{post.description}</p>
									</div>
									<div class="archive-row-meta">
										<span>{post.category ?? t('common.uncategorized')}</span>
										<div class="tag-row">
											{#each post.tags.slice(0, 2) as tag, index (post.tagSlugs[index])}
												<TagChip href={`/tags/${post.tagSlugs[index]}`} label={tag} />
											{/each}
										</div>
									</div>
								</a>
							{/each}
						{:else}
							<div class="archive-row archive-row-empty">
								<div>
									<p class="archive-row-date">{t('blog.archive.emptyDate')}</p>
									<h3>{t('blog.archive.emptyTitle')}</h3>
									<p>{t('blog.archive.emptyDescription')}</p>
								</div>
							</div>
						{/if}
					</div>
				</section>
			{/each}
		</div>

		<aside class="panel archive-layout-side">
			<div class="panel-heading">
				<div>
					<p class="eyebrow">{t('blog.archive.yearEyebrow')}</p>
					<h2>{t('blog.archive.yearTitle')}</h2>
				</div>
			</div>

			<div class="year-stack">
				{#each data.yearGroups as group (group.year)}
					<section class="year-card">
						<div class="year-card-head">
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
