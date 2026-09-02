<script lang="ts">
	import { page } from '$app/state'
	import { resolve } from '$app/paths'
	import { translate } from '$lib/i18n'

	const messages = $derived(page.data.i18n?.messages)
	const t = (key: string) => translate(messages, key)
	const items = $derived([
		{ href: '/manage/posts' as const, label: t('manage.nav.posts') },
		{ href: '/manage/updates' as const, label: t('manage.nav.updates') },
		{ href: '/manage/favorites' as const, label: t('manage.nav.favorites') }
	])
	const activeIndex = $derived(
		Math.max(
			0,
			items.findIndex((item) => page.url.pathname.startsWith(item.href))
		)
	)
</script>

<nav
	aria-label={t('manage.nav.ariaLabel')}
	class="manage-content-nav"
	style:--manage-active-index={activeIndex}
>
	{#each items as item (item.href)}
		<a class:active={page.url.pathname.startsWith(item.href)} href={resolve(item.href)}>
			{item.label}
		</a>
	{/each}
</nav>

<style>
	.manage-content-nav {
		position: relative;
		display: grid;
		grid-template-columns: repeat(3, minmax(5.6rem, 1fr));
		gap: 0.35rem;
		align-items: center;
		width: fit-content;
		padding: 0.3rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: rgb(247 251 255 / 62%);
	}

	.manage-content-nav::before {
		content: '';
		position: absolute;
		top: 0.3rem;
		bottom: 0.3rem;
		left: 0.3rem;
		width: calc((100% - 0.6rem - 0.7rem) / 3);
		border-radius: 999px;
		background: rgb(79 120 255 / 12%);
		transform: translateX(calc(var(--manage-active-index) * (100% + 0.35rem)));
		transition: transform var(--motion-manage-active-indicator-duration)
			var(--motion-shared-easing-standard);
	}

	a {
		position: relative;
		z-index: 1;
		min-width: max-content;
		text-align: center;
		padding: 0.58rem 0.9rem;
		border-radius: 999px;
		color: var(--ink-soft);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.04em;
		cursor: inherit;
	}

	a.active {
		color: var(--ink);
	}

	a:focus-visible {
		outline: 2px solid rgb(79 120 255 / 40%);
		outline-offset: 2px;
	}
</style>
