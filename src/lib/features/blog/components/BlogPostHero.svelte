<script lang="ts">
	import { resolve } from '$app/paths'

	import { siteConfig } from '$lib/config/site'
	import type { AppLocale } from '$lib/i18n/config'
	import { formatDate } from '$lib/utils/date'
	import type { BlogPost } from '$lib/types/content'

	let {
		post,
		locale,
		statusLabel,
		featuredLabel,
		publishedLabel,
		categoryLabel,
		slugLabel,
		publishedAtLabel,
		updatedAtLabel,
		authorLabel,
		uncategorizedLabel,
		backArchiveLabel
	}: {
		post: BlogPost
		locale?: AppLocale
		statusLabel: string
		featuredLabel: string
		publishedLabel: string
		categoryLabel: string
		slugLabel: string
		publishedAtLabel: string
		updatedAtLabel: string
		authorLabel: string
		uncategorizedLabel: string
		backArchiveLabel: string
	} = $props()
</script>

<header class="panel dossier-hero">
	<div class="dossier-hero-top">
		<p class="eyebrow">{statusLabel}</p>
		<a class="button-secondary dossier-hero-back" href={resolve('/blog/archive')}>
			{backArchiveLabel}
		</a>
	</div>

	<div class="dossier-hero-header">
		<div>
			<h1>{post.title}</h1>
			<p class="post-description">{post.description}</p>
		</div>

		<div class="dossier-hero-stats">
			<div class="dossier-stat">
				<span>{statusLabel}</span>
				<strong>{post.featured ? featuredLabel : publishedLabel}</strong>
			</div>
			<div class="dossier-stat">
				<span>{categoryLabel}</span>
				<strong>{post.category ?? uncategorizedLabel}</strong>
			</div>
			<div class="dossier-stat">
				<span>{slugLabel}</span>
				<strong>{post.slug}</strong>
			</div>
		</div>
	</div>

	<div class="post-meta">
		<span>{publishedAtLabel} {formatDate(post.date, locale)}</span>
		<span>{updatedAtLabel} {formatDate(post.updated, locale)}</span>
		<span>{authorLabel} {post.author ?? siteConfig.author}</span>
	</div>
</header>
