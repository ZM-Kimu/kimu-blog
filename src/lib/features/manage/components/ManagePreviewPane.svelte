<script lang="ts">
	let { html } = $props<{ html: string }>()
</script>

<section class="manage-preview panel">
	<div class="content-prose article-prose post-reader-prose manage-preview-content">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html html}
	</div>
</section>

<style>
	.manage-preview {
		padding: clamp(1rem, 1.6vw, 1.4rem);
	}

	.manage-preview-content {
		width: 100%;
		padding: 0;
	}
</style>
