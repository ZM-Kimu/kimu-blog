<script lang="ts">
	import { page } from '$app/state'
	import { resolve } from '$app/paths'
	import { translate } from '$lib/i18n'
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
	const messages = $derived(page.data.i18n?.messages)
	const locale = $derived(page.data.i18n?.locale)
	const t = (key: string, params?: Record<string, string | number>) =>
		translate(messages, key, params)

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
	<div class="manage-list-toolbar">
		<div>
			<p class="eyebrow">{t('manage.list.eyebrow')}</p>
			<h2>{t('manage.list.title')}</h2>
		</div>

		<div class="manage-list-actions">
			<label class="manage-list-search">
				<span>{t('manage.list.search')}</span>
				<input bind:value={query} placeholder={t('manage.list.searchPlaceholder')} type="search" />
			</label>

			{#if createHref.startsWith('#')}
				<button class="button-primary" type="button" onclick={() => followDebugHref(createHref)}>
					{t('manage.list.newPost')}
				</button>
			{:else}
				<a class="button-primary" href={resolve(createHref)}>{t('manage.list.newPost')}</a>
			{/if}
		</div>
	</div>

	<div class="manage-list-meta">
		<strong
			>{t('common.visibleRecords', {
				count: String(filteredItems.length).padStart(2, '0')
			})}</strong
		>
		<span>{t('common.totalRecords', { count: String(items.length).padStart(2, '0') })}</span>
	</div>

	<div class="manage-list-rows">
		{#if filteredItems.length}
			{#each filteredItems as item (item.slug)}
				{@const itemHref = resolveItemHref(item.slug)}
				{#if itemHref.startsWith('#')}
					<button class="manage-post-row" type="button" onclick={() => followDebugHref(itemHref)}>
						<div class="manage-post-row-main">
							<div class="manage-post-row-headline">
								<h3>{item.title}</h3>
								<div class="manage-post-row-chips">
									{#if item.draft}
										<span class="manage-chip manage-chip-draft">{t('manage.list.draft')}</span>
									{/if}
									{#if item.featured}
										<span class="manage-chip manage-chip-featured">{t('manage.list.featured')}</span
										>
									{/if}
									<span class="manage-chip">{item.format}</span>
								</div>
							</div>

							<p>{item.description}</p>
						</div>

						<div class="manage-post-row-side">
							<strong>{item.slug}</strong>
							<span>{item.category ?? t('common.uncategorized')}</span>
							<small>{t('common.updatedAt', { date: formatDate(item.updated, locale) })}</small>
						</div>
					</button>
				{:else}
					<a class="manage-post-row" href={resolve(itemHref)}>
						<div class="manage-post-row-main">
							<div class="manage-post-row-headline">
								<h3>{item.title}</h3>
								<div class="manage-post-row-chips">
									{#if item.draft}
										<span class="manage-chip manage-chip-draft">{t('manage.list.draft')}</span>
									{/if}
									{#if item.featured}
										<span class="manage-chip manage-chip-featured">{t('manage.list.featured')}</span
										>
									{/if}
									<span class="manage-chip">{item.format}</span>
								</div>
							</div>

							<p>{item.description}</p>
						</div>

						<div class="manage-post-row-side">
							<strong>{item.slug}</strong>
							<span>{item.category ?? t('common.uncategorized')}</span>
							<small>{t('common.updatedAt', { date: formatDate(item.updated, locale) })}</small>
						</div>
					</a>
				{/if}
			{/each}
		{:else}
			<div class="manage-list-empty">
				<strong>{t('manage.list.noMatchesTitle')}</strong>
				<span>{t('manage.list.noMatchesDescription')}</span>
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

	.manage-list-toolbar,
	.manage-list-actions,
	.manage-list-meta,
	.manage-post-row-headline {
		display: flex;
		gap: 0.8rem;
		align-items: center;
		justify-content: space-between;
	}

	.manage-list-toolbar {
		flex-wrap: wrap;
	}

	.manage-list-toolbar h2 {
		margin: 0.15rem 0 0;
		font-family: var(--font-display);
		font-size: 2rem;
		letter-spacing: -0.04em;
	}

	.manage-list-actions {
		flex-wrap: wrap;
	}

	.manage-list-search {
		display: grid;
		gap: 0.35rem;
		min-width: min(24rem, 100%);
	}

	.manage-list-search span,
	.manage-list-meta span,
	.manage-post-row-side small {
		font-family: var(--font-mono);
		font-size: 0.74rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}

	.manage-list-search input {
		padding: 0.8rem 0.95rem;
		border: 1px solid var(--line);
		border-radius: 18px;
		background: rgb(255 255 255 / 74%);
	}

	.manage-list-meta strong {
		font-family: var(--font-display);
	}

	.manage-list-rows {
		display: grid;
		gap: 0.8rem;
	}

	.manage-post-row,
	.manage-list-empty {
		--site-press-scale: 1;
		--site-press-translate-y: 0px;

		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 1rem;
		padding: 1rem 1.05rem;
		border: 1px solid var(--line);
		border-radius: 22px;
		background: rgb(255 255 255 / 64%);
		scale: var(--site-press-scale);
		translate: 0 var(--site-press-translate-y);
		transform-origin: center;
		touch-action: manipulation;
		transition:
			transform var(--motion-shared-ease-standard),
			translate var(--motion-press-out-duration) var(--motion-shared-easing-standard),
			scale var(--motion-press-out-duration) var(--motion-shared-easing-standard),
			border-color var(--motion-shared-ease-standard),
			background-color var(--motion-shared-ease-standard);
	}

	.manage-post-row {
		width: 100%;
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.manage-post-row:hover {
		transform: translateY(-2px);
		border-color: rgb(79 120 255 / 24%);
		background: rgb(255 255 255 / 84%);
	}

	.manage-post-row:active {
		--site-press-scale: var(--motion-press-active-scale);
		--site-press-translate-y: var(--motion-press-active-translate-y);

		transition-duration: var(--motion-press-in-duration);
	}

	.manage-post-row-headline {
		flex-wrap: wrap;
		justify-content: flex-start;
	}

	.manage-post-row-headline h3 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.2rem;
	}

	.manage-post-row p {
		margin: 0.45rem 0 0;
		color: var(--ink-soft);
	}

	.manage-post-row-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.manage-chip {
		padding: 0.22rem 0.55rem;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: rgb(255 255 255 / 82%);
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.manage-chip-draft {
		border-color: rgb(247 185 79 / 36%);
		background: rgb(247 185 79 / 12%);
	}

	.manage-chip-featured {
		border-color: rgb(11 184 135 / 36%);
		background: rgb(11 184 135 / 12%);
	}

	.manage-post-row-side {
		display: grid;
		align-content: start;
		justify-items: end;
		gap: 0.2rem;
		text-align: right;
	}

	.manage-post-row-side strong {
		font-family: var(--font-mono);
		font-size: 0.86rem;
	}

	.manage-list-empty {
		grid-template-columns: 1fr;
		justify-items: center;
		text-align: center;
	}

	@media (width <= 860px) {
		.manage-post-row,
		.manage-list-empty {
			grid-template-columns: 1fr;
		}

		.manage-post-row-side {
			justify-items: start;
			text-align: left;
		}
	}
</style>
