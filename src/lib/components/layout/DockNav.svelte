<script lang="ts">
	import { resolve } from '$app/paths'
	import { page } from '$app/state'
	import { appShellNav } from '$lib/config/app-shell'
	import { translate, type LocaleMessages } from '$lib/i18n'

	let { messages }: { messages?: LocaleMessages } = $props()
	const t = (key: string) => (messages ? translate(messages, key) : key)

	const isActive = (href: string) =>
		href === '/' ? page.url.pathname === href : page.url.pathname.startsWith(href)
</script>

<nav class="dock-nav shell" aria-label={t('shell.aria.quickNav')}>
	<div class="dock-nav__surface">
		{#each appShellNav as item (item.href)}
			<a class:active={isActive(item.href)} class="dock-nav__item" href={resolve(item.href)}>
				<span class="dock-nav__code">{item.code}</span>
				<span class="dock-nav__label">{t(item.labelKey)}</span>
			</a>
		{/each}
	</div>
</nav>
