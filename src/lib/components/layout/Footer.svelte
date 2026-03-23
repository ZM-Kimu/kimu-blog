<script lang="ts">
	import { siteConfig } from '$lib/constants/site';
</script>

<footer class="site-footer">
	<div class="shell site-footer__inner">
		<div>
			<strong>{siteConfig.name}</strong>
			<small>Light futuristic command center for articles, logs, and curated references.</small>
		</div>

		<small>Built with SvelteKit, mdsvex, schema validation, and prerender-first routing.</small>
	</div>
</footer>
