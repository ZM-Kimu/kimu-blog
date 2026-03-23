<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { siteConfig } from '$lib/constants/site';
</script>

<header class="site-header">
	<div class="shell site-header__inner">
		<a class="brand" href={resolve('/')}>
			<span class="brand-mark">K</span>
			<span>{siteConfig.name}</span>
		</a>

		<nav class="nav" aria-label="主导航">
			{#each siteConfig.nav as item (item.href)}
				<a class:active={page.url.pathname === item.href} href={resolve(item.href)}>
					{item.label}
				</a>
			{/each}
		</nav>
	</div>
</header>
