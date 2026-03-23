<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { hudStatusChips } from '$lib/constants/command-center';
	import { siteConfig } from '$lib/constants/site';

	let compact = $state(false);

	const currentSection = $derived.by(() => {
		const { pathname } = page.url;

		if (pathname === '/blog/archive') {
			return '归档';
		}

		if (pathname.startsWith('/blog/') && pathname !== '/blog') {
			return '档案';
		}

		return (
			siteConfig.nav.find((item) =>
				item.href === '/' ? pathname === item.href : pathname.startsWith(item.href)
			)?.label ?? '界面'
		);
	});

	const toggleCompact = () => {
		compact = !compact;
	};
</script>

<header class:compact class="hud-header">
	<div class="shell hud-header__surface">
		<a class="hud-brand" href={resolve('/')}>
			<span class="hud-brand__mark">KB</span>
			<span class="hud-brand__copy">
				<small>Command Center</small>
				<strong>{siteConfig.name}</strong>
			</span>
		</a>

		<nav class="hud-nav" aria-label="主导航">
			{#each siteConfig.nav as item (item.href)}
				<a
					class:active={item.href === '/'
						? page.url.pathname === item.href
						: page.url.pathname.startsWith(item.href)}
					href={resolve(item.href)}
				>
					<span>{item.code}</span>
					<strong>{item.label}</strong>
				</a>
			{/each}
		</nav>

		<div class="hud-status">
			<div class="hud-status__current">
				<span>Current</span>
				<strong>{currentSection}</strong>
			</div>
			{#if !compact}
				<div class="hud-status__chips">
					{#each hudStatusChips as chip (chip.label)}
						<div class="hud-inline-chip">
							<span>{chip.label}</span>
							<strong>{chip.value}</strong>
						</div>
					{/each}
				</div>
			{/if}
			<button class="hud-toggle" type="button" onclick={toggleCompact}>
				{compact ? 'Expand' : 'Collapse'}
			</button>
		</div>
	</div>
</header>
