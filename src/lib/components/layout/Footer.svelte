<script lang="ts">
	import { siteConfig } from '$lib/constants/site';
</script>

<footer class="site-footer">
	<div class="shell site-footer__inner">
		<div>
			<strong>{siteConfig.name}</strong>
			<small>Content-first scaffold for SvelteKit + Cloudflare Pages.</small>
		</div>

		<small>Built with mdsvex, schema validation and prerender-first routing.</small>
	</div>
</footer>
