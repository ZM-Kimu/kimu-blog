<script lang="ts">
	import { goto } from '$app/navigation'
	import { resolve } from '$app/paths'
	import { homeDockItems } from './config'
	import HomeMiniPlayer from './components/HomeMiniPlayer.svelte'
	import PortraitHomePage from './PortraitHomePage.svelte'
	import type { HomePageData } from './home-page.types'
	import { translate, type I18nPayload } from '$lib/i18n'
	import { getPublicLayoutContext } from '$lib/layout/public-layout'
	import { getMusicPlayerContext } from '$lib/music/context'
	import { getNavigationContext } from '$lib/navigation/context'

	const homeWorkTarget = '/blog'

	let { data }: { data: HomePageData & { i18n?: I18nPayload } } = $props()

	const { navigationManager } = getNavigationContext()
	const { musicPlayer } = getMusicPlayerContext()
	const { getMode } = getPublicLayoutContext()
	const messages = $derived(data.i18n?.messages)
	const isPortraitLayout = $derived(getMode() === 'portrait')

	function t(key: string, params?: Record<string, string | number>) {
		return translate(messages, key, params)
	}

	async function handleWorkAction() {
		if (navigationManager.phase !== 'idle') {
			return
		}

		await goto(resolve(homeWorkTarget))
	}
</script>

{#if isPortraitLayout}
	<PortraitHomePage {data} />
{:else}
	<section class="home-shell">
		<div class="screen-home">
			<aside class="home-right-pane">
				{#if data.featuredPost}
					<a class="home-event-banner" href={resolve(data.featuredPost.permalink)}>
						<span class="home-event-banner-tag">{t('home.banner.featured')}</span>
						<strong>{data.featuredPost.title}</strong>
						<small>{data.featuredPost.category ?? t('common.uncategorized')}</small>
					</a>
				{/if}

				<button
					class="action-work"
					type="button"
					disabled={navigationManager.phase !== 'idle'}
					aria-label={`${t('home.action.enterContent')} ${t('nav.blog')}`}
					onclick={handleWorkAction}
				>
					<span class="action-work-icon" aria-hidden="true"></span>
					<span class="action-label action-label-primary">{t('nav.blog')}</span>
				</button>
			</aside>

			{#if musicPlayer.hasTracks}
				<HomeMiniPlayer {messages} />
			{/if}

			<footer class="home-footer">
				<nav class="home-footer-dock" aria-label={t('a11y.home.footerNav')}>
					{#each homeDockItems as item (item.href)}
						<a class={`dock-item dock-item-${item.accent}`} href={resolve(item.href)}>
							<span class="dock-item-icon"></span>
							<span class="dock-item-label">{t(item.labelKey)}</span>
						</a>
					{/each}
				</nav>
			</footer>
		</div>

		<section class="home-height-guard panel" role="status" aria-live="polite">
			<h2>{t('home.banner.heightGuardTitle')}</h2>
			<p>{t('home.banner.heightGuardDescription')}</p>
		</section>
	</section>
{/if}
