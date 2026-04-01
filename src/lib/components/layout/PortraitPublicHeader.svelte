<script lang="ts">
	import { resolve } from '$app/paths'
	import { onMount } from 'svelte'
	import { siteConfig } from '$lib/config/site'
	import { translate, type LocaleMessages } from '$lib/i18n'
	import { getNavigationContext } from '$lib/navigation/context'
	import type { PageState } from '$lib/navigation/types'

	let {
		pageState,
		messages
	}: {
		pageState: PageState
		messages?: LocaleMessages
	} = $props()

	const { navigationManager } = getNavigationContext()
	let shellHidden = $state(false)

	function t(key: string) {
		return translate(messages, key)
	}

	async function handleBack() {
		await navigationManager.goBack(pageState.topbar.back)
	}

	const showBack = $derived(Boolean(pageState.topbar.back))
	const isHome = $derived(pageState.route.kind === 'home')
	const headerTitle = $derived(isHome ? siteConfig.name : pageState.title)
	const workHref = resolve('/blog')

	onMount(() => {
		let lastScrollY = window.scrollY

		const handleScroll = () => {
			const nextScrollY = window.scrollY

			if (nextScrollY <= 24) {
				shellHidden = false
				lastScrollY = nextScrollY
				return
			}

			if (nextScrollY > lastScrollY + 8) {
				shellHidden = true
			} else if (nextScrollY < lastScrollY - 8) {
				shellHidden = false
			}

			lastScrollY = nextScrollY
		}

		window.addEventListener('scroll', handleScroll, { passive: true })

		return () => {
			window.removeEventListener('scroll', handleScroll)
		}
	})
</script>

<header class="portrait-public-header">
	<div class:portrait-public-header-shell-hidden={shellHidden} class="portrait-public-header-shell">
		<div class="portrait-public-header-row">
			<div class="portrait-public-header-leading">
				<a aria-label={siteConfig.author} class="portrait-public-header-brand" href={resolve('/')}>
					<span aria-hidden="true" class="portrait-public-header-mark">
						<img src="/profile.png" alt="" draggable="false" />
					</span>
				</a>

				{#if showBack}
					<button
						class="portrait-public-header-back"
						type="button"
						aria-label={t('common.back')}
						onclick={handleBack}
					>
						<span aria-hidden="true">←</span>
						<strong>{t('common.back')}</strong>
					</button>
				{/if}
			</div>

			<div class="portrait-public-header-copy">
				<h1>{headerTitle}</h1>
			</div>
		</div>

		{#if isHome}
			<nav aria-label={t('shell.aria.quickNav')} class="portrait-public-header-nav">
				<a class="action-work portrait-home-work" href={workHref}>
					<span class="action-badge">{t('home.action.badge')}</span>
					<span class="action-label">{t('home.action.enterContent')}</span>
					<span class="action-label action-label-primary">{t('nav.blog')}</span>
				</a>
			</nav>
		{/if}
	</div>
</header>
