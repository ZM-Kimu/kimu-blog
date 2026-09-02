<script lang="ts">
	import ScrollChrome from '$lib/components/ui/ScrollChrome.svelte'

	let { html, emptyLabel } = $props<{ html: string; emptyLabel: string }>()

	const hasPreviewContent = $derived(Boolean(html.trim()))
</script>

<section class="manage-preview panel">
	<ScrollChrome class="manage-preview-scroll" viewportClass="manage-preview-viewport">
		<div class="content-prose article-prose post-reader-prose manage-preview-content">
			{#if hasPreviewContent}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html html}
			{:else}
				<p class="manage-preview-empty">{emptyLabel}</p>
			{/if}
		</div>
	</ScrollChrome>
</section>

<style>
	.manage-preview {
		height: 100%;
		min-height: 0;
		padding: 0;
	}

	.manage-preview-content {
		width: 100%;
		padding: 0;
	}

	.manage-preview-empty {
		margin: 0;
		color: var(--ink-faint);
	}

	@media (width <= 1180px) {
		.manage-preview {
			height: auto;
		}
	}
</style>
