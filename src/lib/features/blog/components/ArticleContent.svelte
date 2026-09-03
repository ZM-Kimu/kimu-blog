<script lang="ts">
	import type { Component } from 'svelte'

	let {
		Content,
		className = ''
	}: {
		Content: Component<Record<string, never>> | null
		className?: string
	} = $props()

	const proseClass = $derived(
		['content-prose', 'article-prose', 'post-reader-prose', className].filter(Boolean).join(' ')
	)
</script>

<div class={proseClass} data-allow-selection>
	{#if Content}
		<Content />
	{/if}
</div>
