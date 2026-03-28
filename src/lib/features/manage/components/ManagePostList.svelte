<script lang="ts">
	import { resolve } from '$app/paths'
	import type { ManagePostListItem } from '$lib/features/manage/types'
	import type { InternalHref } from '$lib/navigation/types'
	import { formatDate } from '$lib/utils/date'

	let {
		items,
		createHref = '/manage/posts/new',
		resolveItemHref = (slug: string) => `/manage/posts/${slug}` as InternalHref
	} = $props<{
		items: ManagePostListItem[]
		createHref?: InternalHref | `#${string}`
		resolveItemHref?: (slug: string) => InternalHref | `#${string}`
	}>()

	let query = $state('')

	const filteredItems = $derived.by(() => {
		const normalized = query.trim().toLowerCase()

		if (!normalized) {
			return items
		}

		return items.filter((item: ManagePostListItem) =>
			[item.title, item.slug, item.description, item.category ?? '']
				.join(' ')
				.toLowerCase()
				.includes(normalized)
		)
	})

	function followDebugHref(href: `#${string}`) {
		if (typeof window === 'undefined') {
			return
		}

		window.location.hash = href
	}
</script>

<section class="manage-list panel">
	<div class="manage-list__toolbar">
		<div>
			<p class="eyebrow">Repository Records</p>
			<h2>文章列表</h2>
		</div>

		<div class="manage-list__actions">
			<label class="manage-list__search">
				<span>搜索</span>
				<input bind:value={query} placeholder="title / slug / category" type="search" />
			</label>

			{#if createHref.startsWith('#')}
				<button class="button-primary" type="button" onclick={() => followDebugHref(createHref)}>
					新建文章
				</button>
			{:else}
				<a class="button-primary" href={resolve(createHref)}>新建文章</a>
			{/if}
		</div>
	</div>

	<div class="manage-list__meta">
		<strong>{String(filteredItems.length).padStart(2, '0')} visible</strong>
		<span>{String(items.length).padStart(2, '0')} total records</span>
	</div>

	<div class="manage-list__rows">
		{#if filteredItems.length}
			{#each filteredItems as item (item.slug)}
				{@const itemHref = resolveItemHref(item.slug)}
				{#if itemHref.startsWith('#')}
					<button class="manage-post-row" type="button" onclick={() => followDebugHref(itemHref)}>
						<div class="manage-post-row__main">
							<div class="manage-post-row__headline">
								<h3>{item.title}</h3>
								<div class="manage-post-row__chips">
									{#if item.draft}
										<span class="manage-chip manage-chip--draft">draft</span>
									{/if}
									{#if item.featured}
										<span class="manage-chip manage-chip--featured">featured</span>
									{/if}
									<span class="manage-chip">{item.format}</span>
								</div>
							</div>

							<p>{item.description}</p>
						</div>

						<div class="manage-post-row__side">
							<strong>{item.slug}</strong>
							<span>{item.category ?? '未分类'}</span>
							<small>更新于 {formatDate(item.updated)}</small>
						</div>
					</button>
				{:else}
					<a class="manage-post-row" href={resolve(itemHref)}>
						<div class="manage-post-row__main">
							<div class="manage-post-row__headline">
								<h3>{item.title}</h3>
								<div class="manage-post-row__chips">
									{#if item.draft}
										<span class="manage-chip manage-chip--draft">draft</span>
									{/if}
									{#if item.featured}
										<span class="manage-chip manage-chip--featured">featured</span>
									{/if}
									<span class="manage-chip">{item.format}</span>
								</div>
							</div>

							<p>{item.description}</p>
						</div>

						<div class="manage-post-row__side">
							<strong>{item.slug}</strong>
							<span>{item.category ?? '未分类'}</span>
							<small>更新于 {formatDate(item.updated)}</small>
						</div>
					</a>
				{/if}
			{/each}
		{:else}
			<div class="manage-list__empty">
				<strong>No matches</strong>
				<span>当前筛选条件下没有文章。</span>
			</div>
		{/if}
	</div>
</section>

<style>
	.manage-list {
		display: grid;
		gap: 1rem;
		padding: 1.2rem;
	}

	.manage-list__toolbar,
	.manage-list__actions,
	.manage-list__meta,
	.manage-post-row__headline {
		display: flex;
		gap: 0.8rem;
		align-items: center;
		justify-content: space-between;
	}

	.manage-list__toolbar {
		flex-wrap: wrap;
	}

	.manage-list__toolbar h2 {
		margin: 0.15rem 0 0;
		font-family: var(--font-display);
		font-size: 2rem;
		letter-spacing: -0.04em;
	}

	.manage-list__actions {
		flex-wrap: wrap;
	}

	.manage-list__search {
		display: grid;
		gap: 0.35rem;
		min-width: min(24rem, 100%);
	}

	.manage-list__search span,
	.manage-list__meta span,
	.manage-post-row__side small {
		font-family: var(--font-mono);
		font-size: 0.74rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}

	.manage-list__search input {
		padding: 0.8rem 0.95rem;
		border: 1px solid var(--line);
		border-radius: 18px;
		background: rgba(255, 255, 255, 0.74);
	}

	.manage-list__meta strong {
		font-family: var(--font-display);
	}

	.manage-list__rows {
		display: grid;
		gap: 0.8rem;
	}

	.manage-post-row,
	.manage-list__empty {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 1rem;
		padding: 1rem 1.05rem;
		border: 1px solid var(--line);
		border-radius: 22px;
		background: rgba(255, 255, 255, 0.64);
		transition:
			transform var(--ease),
			border-color var(--ease),
			background-color var(--ease);
	}

	.manage-post-row {
		width: 100%;
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.manage-post-row:hover {
		transform: translateY(-2px);
		border-color: rgba(79, 120, 255, 0.24);
		background: rgba(255, 255, 255, 0.84);
	}

	.manage-post-row__headline {
		flex-wrap: wrap;
		justify-content: flex-start;
	}

	.manage-post-row__headline h3 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.2rem;
	}

	.manage-post-row p {
		margin: 0.45rem 0 0;
		color: var(--ink-soft);
	}

	.manage-post-row__chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.manage-chip {
		padding: 0.22rem 0.55rem;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: rgba(255, 255, 255, 0.82);
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.manage-chip--draft {
		border-color: rgba(247, 185, 79, 0.36);
		background: rgba(247, 185, 79, 0.12);
	}

	.manage-chip--featured {
		border-color: rgba(11, 184, 135, 0.36);
		background: rgba(11, 184, 135, 0.12);
	}

	.manage-post-row__side {
		display: grid;
		align-content: start;
		justify-items: end;
		gap: 0.2rem;
		text-align: right;
	}

	.manage-post-row__side strong {
		font-family: var(--font-mono);
		font-size: 0.86rem;
	}

	.manage-list__empty {
		grid-template-columns: 1fr;
		justify-items: center;
		text-align: center;
	}

	@media (max-width: 860px) {
		.manage-post-row,
		.manage-list__empty {
			grid-template-columns: 1fr;
		}

		.manage-post-row__side {
			justify-items: start;
			text-align: left;
		}
	}
</style>
