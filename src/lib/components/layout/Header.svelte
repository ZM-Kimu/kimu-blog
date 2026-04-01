<script lang="ts">
	import { resolve } from '$app/paths'
	import { page } from '$app/state'
	import { translate, type LocaleMessages } from '$lib/i18n'
	import { appShellNav, hudStatusChips } from '$lib/config/app-shell'
	import { siteConfig } from '$lib/config/site'

	let { messages }: { messages?: LocaleMessages } = $props()

	let compact = $state(false)
	const t = (key: string) => translate(messages, key)

	const currentSection = $derived.by(() => {
		const { pathname } = page.url

		if (pathname === '/blog/archive') {
			return t('shell.section.archive')
		}

		if (pathname.startsWith('/blog/') && pathname !== '/blog') {
			return t('shell.section.dossier')
		}

		const activeItem = appShellNav.find((item) =>
			item.href === '/' ? pathname === item.href : pathname.startsWith(item.href)
		)

		return activeItem ? t(activeItem.labelKey) : t('shell.section.interface')
	})

	const toggleCompact = () => {
		compact = !compact
	}
</script>

<header class:compact class="hud-header">
	<div class="shell hud-header-surface">
		<a class="hud-brand" href={resolve('/')}>
			<span class="hud-brand-mark">KB</span>
			<span class="hud-brand-copy">
				<small>{t('shell.brand.tagline')}</small>
				<strong>{siteConfig.name}</strong>
			</span>
		</a>

		<nav class="hud-nav" aria-label={t('shell.aria.primaryNav')}>
			{#each appShellNav as item (item.href)}
				<a
					class:active={item.href === '/'
						? page.url.pathname === item.href
						: page.url.pathname.startsWith(item.href)}
					href={resolve(item.href)}
				>
					<span>{item.code}</span>
					<strong>{t(item.labelKey)}</strong>
				</a>
			{/each}
		</nav>

		<div class="hud-status">
			<div class="hud-status-current">
				<span>{t('shell.status.current')}</span>
				<strong>{currentSection}</strong>
			</div>
			{#if !compact}
				<div class="hud-status-chips">
					{#each hudStatusChips as chip (chip.labelKey)}
						<div class="hud-inline-chip">
							<span>{t(chip.labelKey)}</span>
							<strong>{t(chip.valueKey)}</strong>
						</div>
					{/each}
				</div>
			{/if}
			<button class="hud-toggle" type="button" onclick={toggleCompact}>
				{compact ? t('shell.toggle.expand') : t('shell.toggle.collapse')}
			</button>
		</div>
	</div>
</header>
