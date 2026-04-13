<script lang="ts">
	import ScrollChrome from '$lib/components/ui/ScrollChrome.svelte'
	import type { AppLocale } from '$lib/i18n/config'
	import type { BlogPost } from '$lib/types/content'
	import { formatDate } from '$lib/utils/date'

	type ArchiveCategoryOption = {
		slug: string
		title: string
		count: number
	}

	let {
		totalPosts,
		categoryOptions,
		requestedCategory,
		filteredPosts,
		selectedSlug,
		locale,
		allLabel,
		sectionLabel,
		uncategorizedLabel,
		emptyLabel,
		onSelectCategory,
		onSelectPost
	}: {
		totalPosts: number
		categoryOptions: ArchiveCategoryOption[]
		requestedCategory: string | null
		filteredPosts: BlogPost[]
		selectedSlug: string | null
		locale?: AppLocale
		allLabel: string
		sectionLabel: string
		uncategorizedLabel: string
		emptyLabel: string
		onSelectCategory: (slug: string | null) => void
		onSelectPost: (slug: string) => void
	} = $props()
</script>

<div class="archive-entry-column">
	<section class="panel archive-entry-list" aria-label={sectionLabel}>
		<ScrollChrome class="archive-entry-scroll" viewportClass="archive-entry-stack">
			<div class="archive-entry-toolbar">
				<div class="archive-entry-filter-nav" aria-label={sectionLabel}>
					<button
						type="button"
						class:archive-entry-filter-button-selected={!requestedCategory}
						class="archive-entry-filter-button"
						onclick={() => onSelectCategory(null)}
					>
						<span>{allLabel}</span>
						<small class="archive-entry-filter-count">{totalPosts}</small>
					</button>

					{#each categoryOptions as option (option.slug)}
						<button
							type="button"
							class:archive-entry-filter-button-selected={requestedCategory === option.slug}
							class="archive-entry-filter-button"
							onclick={() => onSelectCategory(option.slug)}
						>
							<span>{option.title}</span>
							<small class="archive-entry-filter-count">{option.count}</small>
						</button>
					{/each}
				</div>
			</div>

			<div class="archive-entry-option-list" role="listbox" aria-label={sectionLabel}>
				{#if filteredPosts.length}
					{#each filteredPosts as post (post.slug)}
						<button
							type="button"
							role="option"
							class:archive-entry-item-selected={selectedSlug === post.slug}
							class="archive-entry-item"
							aria-selected={selectedSlug === post.slug}
							onclick={() => onSelectPost(post.slug)}
						>
							<div class="archive-entry-item-copy">
								<p class="archive-entry-date">{formatDate(post.date, locale)}</p>
								<h2>{post.title}</h2>
								<p>{post.description}</p>
							</div>
							<div class="archive-entry-item-meta">
								<span>{post.category ?? uncategorizedLabel}</span>
								<div class="archive-entry-tag-row">
									{#each post.tags.slice(0, 2) as tag, index (post.tagSlugs[index] ?? tag)}
										<span class="tag-chip archive-entry-tag">{tag}</span>
									{/each}
								</div>
							</div>
						</button>
					{/each}
				{:else}
					<div class="archive-entry-empty">
						<p class="archive-entry-date">{emptyLabel}</p>
					</div>
				{/if}
			</div>
		</ScrollChrome>
	</section>
</div>
