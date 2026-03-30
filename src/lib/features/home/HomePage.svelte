<script lang="ts">
	import { goto } from '$app/navigation'
	import { resolve } from '$app/paths'
	import { homeDockItems, homeQuickActions } from './config'
	import type { HomePageData } from './home-page.types'
	import { createHomePageViewModel } from './home-page.view-model'
	import { translate, type I18nPayload } from '$lib/i18n'
	import { getNavigationContext } from '$lib/navigation/context'

	const homeWorkTarget = '/blog'

	let { data }: { data: HomePageData & { i18n?: I18nPayload } } = $props()

	const { navigationManager } = getNavigationContext()
	const messages = $derived(data.i18n?.messages)
	const viewModel = $derived.by(() => createHomePageViewModel(data))

	function t(key: string) {
		return messages ? translate(messages, key) : key
	}

	async function handleWorkAction() {
		if (navigationManager.phase !== 'idle') {
			return
		}

		await goto(resolve(homeWorkTarget))
	}
</script>

<section class="home-shell">
	<div class="screen-home">
		<aside class="home-left-tools">
			{#each homeQuickActions as action (action.href)}
				<a class={`tool-chip tool-chip--${action.accent}`} href={resolve(action.href)}>
					<span class="tool-chip__icon" aria-hidden="true"></span>
					<span class="tool-chip__label">{t(action.labelKey)}</span>
				</a>
			{/each}
		</aside>

		<aside class="home-right-pane">
			{#if data.featuredPost}
				<a class="home-event-banner" href={resolve(data.featuredPost.permalink)}>
					<span class="home-event-banner__tag">Featured</span>
					<strong>{data.featuredPost.title}</strong>
					<small>{data.featuredPost.category ?? '未分类'}</small>
				</a>
			{/if}

			<button
				class="action--work"
				type="button"
				disabled={navigationManager.phase !== 'idle'}
				onclick={handleWorkAction}
			>
				<span class="action__badge">Main</span>
				<span class="action__label">{t('home.action.enterContent')}</span>
				<span class="action__label action__label--primary">{t('nav.blog')}</span>
			</button>
		</aside>

		<section class="home-mission-strip" aria-label="Mission banner">
			<div class="mission-strip__marquee">
				{#each [false, true] as isClone (isClone)}
					<div class="mission-strip__group" aria-hidden={isClone}>
						{#each viewModel.missionPreview as mission (`${isClone ? 'clone' : 'base'}-${mission.slug}`)}
							<a
								class={`mission-strip__item mission-strip__item--${mission.tone}`}
								href={resolve(mission.href)}
								tabindex={isClone ? -1 : undefined}
							>
								<span>{mission.kicker}</span>
								<strong>{mission.title}</strong>
								<small>{String(mission.count).padStart(2, '0')} records</small>
								<em>{mission.state}</em>
							</a>
						{/each}
					</div>
				{/each}
			</div>
		</section>

		<footer class="home-footer">
			<nav class="home-footer__dock" aria-label="主入口">
				{#each homeDockItems as item (item.href)}
					<a class={`dock-item dock-item--${item.accent}`} href={resolve(item.href)}>
						<span class="dock-item__icon"></span>
						<span class="dock-item__code">{item.code}</span>
						<span class="dock-item__label">{t(item.labelKey)}</span>
					</a>
				{/each}
			</nav>
		</footer>
	</div>

	<section class="home-height-guard panel" role="status" aria-live="polite">
		<p class="eyebrow">Viewport Guard</p>
		<h2>当前窗口高度不足</h2>
		<p>Home shell 需要至少 500px 的可见高度。请增大浏览器窗口，或先切换到内容页。</p>
		<div class="home-height-guard__actions">
			<a class="button-primary" href={resolve('/blog')}>进入内容页</a>
			<a class="section-link" href={resolve('/about')}>查看简介</a>
		</div>
	</section>
</section>
