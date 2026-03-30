<script lang="ts">
	import { page } from '$app/state'
	import { resolve } from '$app/paths'
	import { translate } from '$lib/i18n'
	import PostCard from './components/PostCard.svelte'
	import TagChip from './components/TagChip.svelte'

	let { data } = $props()
	const messages = $derived(page.data.i18n?.messages)
	const t = (key: string, params?: Record<string, string | number>) =>
		translate(messages, key, params)
</script>

<section class="tag-screen">
	<section class="panel mission-intro">
		<div>
			<p class="eyebrow">{t('blog.tag.introEyebrow')}</p>
			<h1>{data.tag.name}</h1>
			<p>{t('blog.tag.introDescription', { count: data.tag.count })}</p>
		</div>

		<div class="hero-actions">
			<TagChip label={data.tag.name} href={`/tags/${data.tag.slug}`} />
			<a class="button-secondary" href={resolve('/blog/archive')}>{t('blog.tag.backArchive')}</a>
		</div>
	</section>

	<div class="post-grid">
		{#each data.posts as post (post.slug)}
			<PostCard {post} />
		{/each}
	</div>
</section>
