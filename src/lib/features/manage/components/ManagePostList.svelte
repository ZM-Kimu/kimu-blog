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
		<label class="manage-list-search">
			<input
				aria-label={t('manage.list.search')}
				bind:value={query}
				placeholder={t('manage.list.searchPlaceholder')}
				type="search"
			/>
		</label>

		<div class="manage-list-controls">
			<span class="manage-list-total">
				{t('manage.list.articleCount', { count: items.length })}
			</span>

			{#if createHref.startsWith('#')}
				<button
					aria-label={t('manage.list.newPost')}
					class="manage-create-button"
					title={t('manage.list.newPost')}
					type="button"
					onclick={() => followDebugHref(createHref)}
				>
					<span aria-hidden="true">+</span>
				</button>
			{:else}
				<a
					aria-label={t('manage.list.newPost')}
					class="manage-create-button"
					href={resolve(createHref)}
					title={t('manage.list.newPost')}
				>
					<span aria-hidden="true">+</span>
				</a>
			{/if}
		</div>
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
		gap: clamp(0.85rem, 1.2vw, 1.1rem);
		padding: clamp(0.9rem, 1.35vw, 1.25rem);
	}

	.manage-list-toolbar,
	.manage-list-controls,
	.manage-post-row-headline {
		display: flex;
		gap: 0.8rem;
		align-items: center;
		justify-content: space-between;
	}

	.manage-list-toolbar {
		width: 100%;
	}

	.manage-list-search {
		display: block;
		flex: 1 1 32rem;
		min-width: 0;
		cursor: inherit;
	}

	.manage-list-total,
	.manage-post-row-side small {
		font-family: var(--font-mono);
		font-size: 0.74rem;
		letter-spacing: 0.065em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}

	.manage-list-search input {
		width: 100%;
		height: 3.1rem;
		padding: 0 1.05rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		outline: none;
		background: rgb(247 251 255 / 76%);
		color: var(--ink);
		cursor: inherit;
		transition:
			border-color var(--motion-shared-ease-standard),
			box-shadow var(--motion-shared-ease-standard),
			background-color var(--motion-shared-ease-standard);
	}

	.manage-list-search input::placeholder {
		color: color-mix(in srgb, var(--ink-faint) 80%, transparent);
	}

	.manage-list-search input:focus {
		border-color: var(--line-strong);
		background: rgb(255 255 255 / 90%);
		box-shadow: 0 0 0 3px rgb(79 120 255 / 8%);
	}

	.manage-list-controls {
		flex: 0 0 auto;
	}

	.manage-create-button {
		display: inline-grid;
		place-items: center;
		width: 3.1rem;
		height: 3.1rem;
		padding: 0;
		border: 1px solid rgb(68 112 201 / 22%);
		border-radius: 50%;
		appearance: none;
		background: linear-gradient(145deg, #78a9ed, #557fd0);
		box-shadow: 0 10px 24px rgb(54 95 174 / 18%);
		color: white;
		cursor: inherit;
	}

	.manage-create-button span {
		font-family: var(--font-sans);
		font-size: 1.65rem;
		font-weight: 300;
		line-height: 1;
		translate: 0 -0.05em;
	}

	.manage-create-button:focus-visible {
		outline: 2px solid rgb(79 120 255 / 44%);
		outline-offset: 3px;
	}

	.manage-list-rows {
		display: grid;
		gap: 0.55rem;
	}

	.manage-post-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(12rem, 0.32fr);
		gap: clamp(1rem, 2vw, 2rem);
		width: 100%;
		min-height: 6.5rem;
		padding: 1rem 1.15rem 1rem 1.25rem;
		border: 1px solid var(--line);
		border-radius: 17px;
		appearance: none;
		background:
			linear-gradient(90deg, rgb(79 120 255 / 8%) 0 3px, transparent 3px), rgb(250 253 255 / 58%);
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: inherit;
	}

	.manage-post-row:focus-visible {
		outline: 2px solid rgb(79 120 255 / 44%);
		outline-offset: 3px;
	}

	.manage-post-row-headline {
		flex-wrap: wrap;
		justify-content: flex-start;
	}

	.manage-post-row-headline h3 {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(1.08rem, 1.4vw, 1.28rem);
		letter-spacing: -0.02em;
	}

	.manage-post-row p {
		margin: 0.5rem 0 0;
		max-width: 76ch;
		color: var(--ink-soft);
		line-height: 1.55;
	}

	.manage-post-row-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.manage-chip {
		padding: 0.2rem 0.5rem;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: rgb(255 255 255 / 70%);
		font-family: var(--font-mono);
		font-size: 0.68rem;
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
		gap: 0.28rem;
		padding-left: 1rem;
		border-left: 1px solid var(--line);
		text-align: right;
	}

	.manage-post-row-side strong {
		font-family: var(--font-mono);
		font-size: 0.86rem;
	}

	.manage-list-empty {
		display: grid;
		gap: 0.35rem;
		justify-items: center;
		padding: 2.5rem 1rem;
		border: 1px dashed var(--line-strong);
		border-radius: 17px;
		background: rgb(250 253 255 / 42%);
		text-align: center;
	}

	@media (width <= 860px) {
		.manage-post-row {
			grid-template-columns: 1fr;
		}

		.manage-post-row-side {
			justify-items: start;
			padding: 0.8rem 0 0;
			border-top: 1px solid var(--line);
			border-left: 0;
			text-align: left;
		}
	}

	@media (width <= 620px) {
		.manage-list-toolbar {
			align-items: stretch;
			flex-wrap: wrap;
		}

		.manage-list-search {
			flex-basis: 100%;
		}

		.manage-list-controls {
			width: 100%;
		}
	}
</style>
