<script lang="ts">
	import { resolve } from '$app/paths'

	import type { BlogPost } from '$lib/types/content'

	import TagChip from './TagChip.svelte'

	let {
		post,
		relatedPosts,
		metadataEyebrow,
		metadataTitle,
		tagsEyebrow,
		tagsTitle,
		relatedEyebrow,
		relatedTitle,
		categoryLabel,
		tagCountLabel,
		renderModeLabel,
		prerenderLabel,
		uncategorizedLabel,
		relatedEmptyTitle,
		relatedEmptyDescription
	}: {
		post: BlogPost
		relatedPosts: BlogPost[]
		metadataEyebrow: string
		metadataTitle: string
		tagsEyebrow: string
		tagsTitle: string
		relatedEyebrow: string
		relatedTitle: string
		categoryLabel: string
		tagCountLabel: string
		renderModeLabel: string
		prerenderLabel: string
		uncategorizedLabel: string
		relatedEmptyTitle: string
		relatedEmptyDescription: string
	} = $props()
</script>

<aside class="dossier-side">
	<section class="panel dossier-side-panel">
		<div class="panel-heading">
			<div>
				<p class="eyebrow">{metadataEyebrow}</p>
				<h2>{metadataTitle}</h2>
			</div>
		</div>

		<div class="meta-stack">
			<div>
				<span>{categoryLabel}</span>
				<strong>{post.category ?? uncategorizedLabel}</strong>
			</div>
			<div>
				<span>{tagCountLabel}</span>
				<strong>{String(post.tags.length).padStart(2, '0')}</strong>
			</div>
			<div>
				<span>{renderModeLabel}</span>
				<strong>{prerenderLabel}</strong>
			</div>
		</div>
	</section>

	<section class="panel dossier-side-panel">
		<div class="panel-heading">
			<div>
				<p class="eyebrow">{tagsEyebrow}</p>
				<h2>{tagsTitle}</h2>
			</div>
		</div>

		<div class="tag-row">
			{#each post.tags as tag, index (post.tagSlugs[index])}
				<TagChip href={`/tags/${post.tagSlugs[index]}`} label={tag} />
			{/each}
		</div>
	</section>

	<section class="panel dossier-side-panel">
		<div class="panel-heading">
			<div>
				<p class="eyebrow">{relatedEyebrow}</p>
				<h2>{relatedTitle}</h2>
			</div>
		</div>

		<div class="related-stack">
			{#if relatedPosts.length}
				{#each relatedPosts as relatedPost (relatedPost.slug)}
					<a class="related-link" href={resolve(relatedPost.permalink)}>
						<strong>{relatedPost.title}</strong>
						<span>{relatedPost.category ?? uncategorizedLabel}</span>
					</a>
				{/each}
			{:else}
				<div class="related-link related-link-empty">
					<strong>{relatedEmptyTitle}</strong>
					<span>{relatedEmptyDescription}</span>
				</div>
			{/if}
		</div>
	</section>
</aside>
