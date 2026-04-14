<script lang="ts">
	import type { Component } from 'svelte'

	let {
		Content
	}: {
		Content: Component<Record<string, never>> | null
	} = $props()
</script>

<div class="panel dossier-main">
	<div class="content-prose article-prose">
		{#if Content}
			<Content />
		{/if}
	</div>
</div>
