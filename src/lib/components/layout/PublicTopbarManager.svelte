<script lang="ts">
	import { goto } from '$app/navigation'
	import { resolve } from '$app/paths'
	import { tick, untrack } from 'svelte'

	import { siteConfig } from '$lib/config/site'
	import TopbarSettingsModal from '$lib/features/home/topbar/TopbarSettingsModal.svelte'
	import HomeTopbar from '$lib/features/home/topbar/HomeTopbar.svelte'
	import TopbarReopenButton from '$lib/features/home/topbar/TopbarReopenButton.svelte'
	import '$lib/features/home/styles/topbar/base.css'
	import '$lib/features/home/styles/topbar/main.css'
	import '$lib/features/home/styles/topbar/subpage.css'
	import '$lib/features/home/styles/topbar/motion.css'
	import '$lib/features/home/styles/topbar/responsive.css'
	import { translate, type LocaleMessages } from '$lib/i18n'
	import { getNavigationContext } from '$lib/navigation/context'

	import type {
		HomeTopbarActionDetail,
		TopbarMode
	} from '$lib/features/home/topbar/home-topbar.types'
	import type { PageState, TopbarShellVariant } from '$lib/navigation/types'

	type HomeTopbarHandle = {
		transitionTo: (nextMode: TopbarMode, origin: 'cta' | 'back') => Promise<void>
		setModeImmediate: (nextMode: TopbarMode) => void
	}

	let {
		host = null,
		messages,
		compact = false,
		reducedMotion = false
	}: {
		host?: HTMLElement | null
		messages?: LocaleMessages
		compact?: boolean
		reducedMotion?: boolean
	} = $props()

	const { navigationManager } = getNavigationContext()
	const topbarCollapsed = $derived(navigationManager.topbarCollapsed)
	const cursorMode = $derived(navigationManager.cursorMode)
	const backgroundAnimationPreference = $derived(navigationManager.backgroundAnimationPreference)
	const backgroundAnimationStatus = $derived(navigationManager.backgroundAnimationStatus)
	const backgroundAnimationDisabled = $derived(compact || reducedMotion)
	const backgroundAnimationDescription = $derived.by(() => {
		const segments = [t('topbar.settings.backgroundAnimationDescription')]

		if (backgroundAnimationDisabled) {
			segments.push(t('topbar.settings.backgroundAnimationDisabled'))
		} else if (backgroundAnimationStatus === 'failed') {
			segments.push(t('topbar.settings.backgroundAnimationFailed'))
		}

		return segments.join(' ')
	})
	const currentShellVariant = $derived(navigationManager.pageState.topbarShellVariant)
	const pendingShellVariant = $derived(
		navigationManager.pendingPageState?.topbarShellVariant ?? null
	)
	const shellVariantSwitching = $derived(
		pendingShellVariant !== null && pendingShellVariant !== currentShellVariant
	)

	let homeTopbar: HomeTopbarHandle | null = $state(null)
	let topbarMode = $state<TopbarMode>(
		navigationManager.pageState.topbarShellVariant === 'subpage' ? 'subpage' : 'main'
	)
	let topbarMotionLocked = $state(false)
	let bridgeRequestToken = 0
	let renderedShellVariant = $state<TopbarShellVariant>(
		navigationManager.pageState.topbarShellVariant !== 'none'
			? navigationManager.pageState.topbarShellVariant
			: (navigationManager.pendingPageState?.topbarShellVariant ?? 'none')
	)
	let stageHidden = $state(untrack(() => renderedShellVariant === 'none'))

	const settingsOpen = $derived(
		navigationManager.settingsOpen &&
			renderedShellVariant === 'main' &&
			!topbarCollapsed &&
			!stageHidden
	)
	const expandAriaLabel = $derived(
		navigationManager.locale === 'en-US' ? 'Expand top bar' : '展开 topbar'
	)
	const mainTopbarState = $derived.by(() =>
		resolveTopbarState('main', navigationManager.pageState, navigationManager.pendingPageState)
	)
	const subpageTopbarState = $derived.by(() =>
		resolveTopbarState('subpage', navigationManager.pageState, navigationManager.pendingPageState)
	)
	const interactiveSubpageState = $derived.by(() => {
		if (navigationManager.pageState.topbarShellVariant === 'subpage') {
			return navigationManager.pageState.topbar
		}

		if (
			renderedShellVariant === 'subpage' &&
			navigationManager.pendingPageState?.topbar.variant === 'subpage'
		) {
			return navigationManager.pendingPageState.topbar
		}

		return subpageTopbarState
	})

	function t(key: string) {
		return messages ? translate(messages, key) : key
	}

	function resolveTopbarState(
		variant: 'main' | 'subpage',
		currentPageState: PageState,
		pendingPageState: PageState | null
	) {
		if (currentPageState.topbarShellVariant === variant) {
			return currentPageState.topbar
		}

		if (
			shellVariantSwitching &&
			pendingPageState &&
			pendingPageState.topbarShellVariant === variant &&
			pendingPageState.topbar.variant === variant
		) {
			return pendingPageState.topbar
		}

		if (pendingPageState?.topbar.variant === variant) {
			return pendingPageState.topbar
		}

		return currentPageState.topbar
	}

	function handleTopbarStateChange(event: CustomEvent<{ mode: TopbarMode; locked: boolean }>) {
		topbarMode = event.detail.mode
		topbarMotionLocked = event.detail.locked
	}

	async function handleBack() {
		await navigationManager.goBack(interactiveSubpageState.back)
	}

	async function handleTopbarAction(event: CustomEvent<HomeTopbarActionDetail>) {
		if (topbarMotionLocked) {
			return
		}

		switch (event.detail.action.key) {
			case 'language':
				await navigationManager.toggleLocale()
				break
			case 'collapse':
				navigationManager.toggleTopbarCollapsed()
				break
			case 'settings':
				navigationManager.openTopbarSettings()
				break
			case 'home':
				await goto(resolve('/'))
				break
		}
	}

	export async function bridgeTo(targetShellVariant: TopbarShellVariant) {
		const requestToken = ++bridgeRequestToken
		navigationManager.closeTopbarSettings()

		if (targetShellVariant === 'none') {
			if (renderedShellVariant === 'none') {
				return
			}

			if (requestToken !== bridgeRequestToken) {
				return
			}

			stageHidden = true
			renderedShellVariant = 'none'
			return
		}

		if (renderedShellVariant === 'none') {
			if (requestToken !== bridgeRequestToken) {
				return
			}

			renderedShellVariant = targetShellVariant
			stageHidden = false
			await tick()
			return
		}

		const nextMode: TopbarMode = targetShellVariant === 'subpage' ? 'subpage' : 'main'
		if (homeTopbar && topbarMode !== nextMode) {
			if (topbarCollapsed) {
				homeTopbar.setModeImmediate(nextMode)
			} else {
				await homeTopbar.transitionTo(nextMode, 'cta')
			}
		}

		if (requestToken !== bridgeRequestToken) {
			return
		}

		renderedShellVariant = targetShellVariant
		stageHidden = false
	}

	$effect(() => {
		if (navigationManager.phase !== 'idle') {
			return
		}

		bridgeRequestToken += 1

		if (navigationManager.pageState.topbarShellVariant === 'none') {
			renderedShellVariant = 'none'
			stageHidden = true
			return
		}

		const settledShellVariant = navigationManager.pageState.topbarShellVariant
		const settledMode: TopbarMode = settledShellVariant === 'subpage' ? 'subpage' : 'main'

		renderedShellVariant = settledShellVariant
		stageHidden = false

		if (homeTopbar && topbarMode !== settledMode) {
			homeTopbar.setModeImmediate(settledMode)
		}
	})
</script>

<svelte:window
	onkeydown={(event) => {
		if (settingsOpen && event.key === 'Escape') {
			navigationManager.closeTopbarSettings()
		}
	}}
/>

{#if renderedShellVariant !== 'none'}
	<div
		class:home-topbar-stage-collapsed={topbarCollapsed}
		class:public-topbar-stage-hidden={stageHidden}
		class="home-topbar-stage public-topbar-stage"
	>
		<HomeTopbar
			{host}
			initialMode={renderedShellVariant === 'subpage' ? 'subpage' : 'main'}
			mainMetrics={mainTopbarState.metrics}
			mainActions={mainTopbarState.actions}
			subpageMetrics={subpageTopbarState.metrics}
			subpageActions={subpageTopbarState.actions}
			subpageTitle={subpageTopbarState.title}
			authorName={siteConfig.author}
			profileLevel="90"
			profileHref="/about"
			{compact}
			{reducedMotion}
			onSubpageBack={handleBack}
			bind:this={homeTopbar}
			on:action={handleTopbarAction}
			on:statechange={handleTopbarStateChange}
		/>

		{#if topbarCollapsed && !stageHidden}
			<TopbarReopenButton
				ariaLabel={expandAriaLabel}
				onActivate={() => navigationManager.toggleTopbarCollapsed(false)}
			/>
		{/if}
	</div>
{/if}

{#if settingsOpen}
	<TopbarSettingsModal
		title={t('topbar.settings.title')}
		closeLabel={t('topbar.settings.close')}
		cursorLabel={t('topbar.settings.cursor')}
		cursorDescription={t('topbar.settings.cursorDescription')}
		customLabel={t('topbar.settings.custom')}
		systemLabel={t('topbar.settings.system')}
		backgroundAnimationLabel={t('topbar.settings.backgroundAnimation')}
		{backgroundAnimationDescription}
		backgroundAnimationOnLabel={t('topbar.settings.backgroundAnimationOn')}
		backgroundAnimationOffLabel={t('topbar.settings.backgroundAnimationOff')}
		{backgroundAnimationPreference}
		{backgroundAnimationDisabled}
		manageLabel={t('topbar.settings.manage')}
		manageDescription={t('topbar.settings.manageDescription')}
		manageActionLabel={t('topbar.settings.manageAction')}
		{cursorMode}
		onClose={() => navigationManager.closeTopbarSettings()}
		onSetCursorMode={(mode) => navigationManager.setCursorMode(mode)}
		onSetBackgroundAnimationPreference={(mode) =>
			navigationManager.setBackgroundAnimationPreference(mode)}
	/>
{/if}

<style>
	.public-topbar-stage {
		position: absolute;
		inset: 0 0 auto;
		z-index: 2;
		pointer-events: none;

		--home-shell-padding: clamp(0.78rem, 1.25vw, 1.05rem);
		--home-topbar-height: 5.2rem;
		--home-topbar-gap: 0.85rem;
		--home-resource-gap: 0.65rem;
		--home-profile-min-width: 13rem;
		--home-profile-padding: 0.85rem 1rem;
	}

	.public-topbar-stage-hidden {
		opacity: 0;
		pointer-events: none;
	}
</style>
