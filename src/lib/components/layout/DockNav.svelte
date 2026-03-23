<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { siteConfig } from '$lib/constants/site';

	const isActive = (href: string) =>
		href === '/' ? page.url.pathname === href : page.url.pathname.startsWith(href);
</script>

<nav class="dock-nav shell" aria-label="快捷入口">
	<div class="dock-nav__surface">
		{#each siteConfig.nav as item (item.href)}
			<a class:active={isActive(item.href)} class="dock-nav__item" href={resolve(item.href)}>
				<span class="dock-nav__code">{item.code}</span>
				<span class="dock-nav__label">{item.label}</span>
			</a>
		{/each}
	</div>
</nav>
