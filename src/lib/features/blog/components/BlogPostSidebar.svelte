<script lang="ts">
	import type { AppLocale } from '$lib/i18n/config'
	import type { BlogPost } from '$lib/types/content'
	import { formatDate } from '$lib/utils/date'
	import type { TransitionConfig } from 'svelte/transition'

	import TagChip from './TagChip.svelte'

	let {
		post,
		transitionKey,
		locale,
		metadataTitle,
		categoryLabel,
		publishedAtLabel,
		updatedAtLabel,
		uncategorizedLabel,
		contentTransition,
		contentFadeTransition
	}: {
		post: BlogPost
		transitionKey: string
		locale?: AppLocale
		metadataTitle: string
		categoryLabel: string
		publishedAtLabel: string
		updatedAtLabel: string
		uncategorizedLabel: string
		contentTransition: (node: Element) => TransitionConfig
		contentFadeTransition: (node: Element) => TransitionConfig
	} = $props()
</script>

<aside class="post-aside">
	<section class="post-aside-section post-aside-info">
		<div class="post-aside-heading">
			<h2>{metadataTitle}</h2>
		</div>

		<div class="post-aside-info-transition-host">
			{#key transitionKey}
				<div class="post-aside-info-content" in:contentTransition out:contentFadeTransition>
					<dl class="post-aside-facts">
						<div class="post-aside-fact">
							<dt>{categoryLabel}</dt>
							<dd>{post.category ?? uncategorizedLabel}</dd>
						</div>
						<div class="post-aside-fact">
							<dt>{publishedAtLabel}</dt>
							<dd>{formatDate(post.date, locale)}</dd>
						</div>
						<div class="post-aside-fact">
							<dt>{updatedAtLabel}</dt>
							<dd>{formatDate(post.updated, locale)}</dd>
						</div>
					</dl>

					<div class="post-aside-tag-block">
						<div class="post-aside-tags">
							{#each post.tags as tag, index (post.tagSlugs[index])}
								<TagChip href={`/tags/${post.tagSlugs[index]}`} label={tag} />
							{/each}
						</div>
					</div>
				</div>
			{/key}
		</div>
	</section>
</aside>
