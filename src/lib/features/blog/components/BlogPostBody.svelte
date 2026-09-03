<script lang="ts">
	import type { Component } from 'svelte'
	import type { BlogPost } from '$lib/types/content'

	import ArticleContent from './ArticleContent.svelte'

	let {
		post,
		Content
	}: {
		post: BlogPost
		Content: Component<Record<string, never>> | null
	} = $props()
</script>

<section class="post-reader">
	<img
		alt={post.title}
		class="post-reader-cover"
		decoding="async"
		draggable="false"
		fetchpriority="high"
		src={post.cover}
	/>

	<header class="post-reader-head">
		<h1>{post.title}</h1>
		<p class="post-reader-description">{post.description}</p>
	</header>

	<ArticleContent {Content} />
</section>
