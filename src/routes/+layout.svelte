<script lang="ts">
	import { browser } from '$app/environment'
	import { onNavigate } from '$app/navigation'
	import { page } from '$app/state'
	import { onDestroy, onMount, tick } from 'svelte'
	import { untrack } from 'svelte'
	import '$lib/../app.css'

	import SiteShell from '$lib/components/layout/SiteShell.svelte'
	import { setPublicLayoutContext } from '$lib/layout/public-layout'
	import { createPreviewPageState, wait, waitForNextPaint } from '$lib/layout/navigation-flow'
	import { translate } from '$lib/i18n'
	import { setNavigationContext } from '$lib/navigation/context'
	import { createNavigationStateManager } from '$lib/navigation/navigation-state.svelte'
	import { createPageState } from '$lib/navigation/page-state'
	import { resolveRouteState } from '$lib/navigation/route-state'
	import type { TopbarShellVariant } from '$lib/navigation/types'
	import { bindMediaQuery } from '$lib/features/home/home-page.media'
	import { getMotionTokens } from '$lib/motion/tokens'

	type PublicTopbarManagerHandle = {
		bridgeTo: (targetShellVariant: TopbarShellVariant) => Promise<void>
	}
	type SiteBootPhase = 'boot' | 'entry' | 'idle'

	const portraitQuery = '(orientation: portrait)'
	const coarsePointerQuery = '(pointer: coarse)'
	const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

	let { children, data } = $props()
	let siteFrame: HTMLDivElement | null = $state(null)
	let publicTopbarManager: PublicTopbarManagerHandle | null = $state(null)
	let publicLayoutMode = $state<'landscape' | 'portrait'>('landscape')
	let isCoarsePointer = $state(false)
	let prefersReducedMotion = $state(false)
	let desktopHomeEnterActive = $state(false)
	let desktopSubpageEnterActive = $state(false)
	let queuedDesktopEnterVariant = $state<'none' | 'subpage'>('none')
	let portraitOrientationToastVisible = $state(false)
	let portraitOrientationToastClosing = $state(false)
	let portraitOrientationToastWasEligible = $state(false)
	let siteBootPhase = $state<SiteBootPhase>(
		page.url.pathname === '/manage' || page.url.pathname.startsWith('/manage/') ? 'idle' : 'boot'
	)

	const navigationManager = createNavigationStateManager(
		untrack(() => resolveRouteState({ pathname: page.url.pathname, status: page.status })),
		untrack(() =>
			createPageState({
				routeState: resolveRouteState({ pathname: page.url.pathname, status: page.status }),
				data,
				messages: data.i18n?.messages
			})
		)
	)

	setNavigationContext({ navigationManager })
	setPublicLayoutContext({
		getMode: () => publicLayoutMode
	})

	const messages = $derived(data.i18n?.messages)
	const routeState = $derived(
		resolveRouteState({ pathname: page.url.pathname, status: page.status })
	)
	const pageState = $derived(
		createPageState({
			routeState,
			data,
			messages
		})
	)
	const isManageRoute = $derived(routeState.kind === 'manage')
	const isPublicScreenRoute = $derived(pageState.shellMode === 'screen' && !isManageRoute)
	const isPortraitPublicLayout = $derived(isPublicScreenRoute && publicLayoutMode === 'portrait')
	const isLandscapePublicLayout = $derived(!isPortraitPublicLayout)
	const isBareRoute = $derived(isPublicScreenRoute || isManageRoute)
	const showGlobalChrome = $derived(pageState.showGlobalChrome)
	const isRouteOutgoing = $derived(navigationManager.phase === 'exit')
	const exitingRouteState = $derived(navigationManager.exitingRouteState)
	const useDesktopHomeExit = $derived(
		isRouteOutgoing && exitingRouteState?.kind === 'home' && isLandscapePublicLayout
	)
	const useDesktopBlogExit = $derived(
		isRouteOutgoing && exitingRouteState?.kind === 'blog' && isLandscapePublicLayout
	)
	const isRouteEntering = $derived(
		navigationManager.phase === 'entry' && navigationManager.pendingTarget === page.url.pathname
	)
	const showBackgroundStage = $derived(
		isBareRoute ||
			navigationManager.phase !== 'idle' ||
			navigationManager.backgroundScene !== 'neutral-default' ||
			navigationManager.pendingBackgroundScene !== null
	)
	const enableSiteClickEffect = $derived(!prefersReducedMotion && siteBootPhase !== 'boot')
	const motionTokens = $derived(
		getMotionTokens({
			portrait: isPortraitPublicLayout,
			reducedMotion: prefersReducedMotion
		})
	)
	const portraitOrientationHint = $derived(
		translate(
			messages,
			isCoarsePointer ? 'shell.portraitHint.mobile' : 'shell.portraitHint.desktop'
		)
	)
	const siteFrameMotionStyle = $derived.by(() => {
		const tokens = motionTokens
		const activeBootEntryDurationMs = siteBootPhase === 'idle' ? 0 : tokens.boot.entryDurationMs
		return `--motion-boot-active-entry-duration: ${activeBootEntryDurationMs}ms;`
	})
	let desktopHomeEnterTimer: ReturnType<typeof setTimeout> | null = null
	let desktopSubpageEnterTimer: ReturnType<typeof setTimeout> | null = null
	let portraitOrientationToastTimer: ReturnType<typeof setTimeout> | null = null
	let portraitOrientationToastExitTimer: ReturnType<typeof setTimeout> | null = null

	function clearDesktopHomeEnterTimer() {
		if (desktopHomeEnterTimer === null) {
			return
		}

		clearTimeout(desktopHomeEnterTimer)
		desktopHomeEnterTimer = null
	}

	function clearDesktopSubpageEnterTimer() {
		if (desktopSubpageEnterTimer === null) {
			return
		}

		clearTimeout(desktopSubpageEnterTimer)
		desktopSubpageEnterTimer = null
	}

	function clearPortraitOrientationToastTimers() {
		if (portraitOrientationToastTimer !== null) {
			clearTimeout(portraitOrientationToastTimer)
			portraitOrientationToastTimer = null
		}

		if (portraitOrientationToastExitTimer !== null) {
			clearTimeout(portraitOrientationToastExitTimer)
			portraitOrientationToastExitTimer = null
		}
	}

	function hidePortraitOrientationToastImmediate() {
		clearPortraitOrientationToastTimers()
		portraitOrientationToastClosing = false
		portraitOrientationToastVisible = false
	}

	function showPortraitOrientationToast() {
		hidePortraitOrientationToastImmediate()
		portraitOrientationToastVisible = true
		portraitOrientationToastClosing = false

		portraitOrientationToastTimer = setTimeout(() => {
			portraitOrientationToastTimer = null
			portraitOrientationToastClosing = true

			portraitOrientationToastExitTimer = setTimeout(() => {
				portraitOrientationToastExitTimer = null
				portraitOrientationToastClosing = false
				portraitOrientationToastVisible = false
			}, motionTokens.notice.exitDurationMs)
		}, motionTokens.notice.visibleDurationMs)
	}

	function handleDocumentDragStart(event: DragEvent) {
		const target = event.target
		if (!(target instanceof Element)) {
			return
		}

		if (target.closest('[data-allow-drag]')) {
			return
		}

		event.preventDefault()
	}

	onDestroy(() => {
		clearDesktopHomeEnterTimer()
		clearDesktopSubpageEnterTimer()
		clearPortraitOrientationToastTimers()
	})

	onNavigate((navigation) => {
		if (navigation.willUnload || !navigation.to?.url) {
			return
		}

		const targetPath = navigation.to.url.pathname
		if (targetPath === page.url.pathname) {
			return
		}

		clearDesktopHomeEnterTimer()
		clearDesktopSubpageEnterTimer()
		desktopHomeEnterActive = false
		desktopSubpageEnterActive = false
		queuedDesktopEnterVariant = 'none'

		const { routeState: targetRouteState, pageState: targetPageState } = createPreviewPageState({
			pathname: targetPath,
			data,
			messages
		})
		const started = navigationManager.beginPageSwitch(targetPath, targetPageState, {
			origin: `navigate:${navigation.type}`,
			portrait: isPortraitPublicLayout,
			reducedMotion: prefersReducedMotion
		})

		if (!started) {
			return
		}

		if (
			isLandscapePublicLayout &&
			pageState.motionFamily === 'main' &&
			targetPageState.shellMode === 'screen' &&
			targetRouteState.kind !== 'manage' &&
			targetPageState.motionFamily === 'subpage'
		) {
			queuedDesktopEnterVariant = 'subpage'
		}

		void navigation.complete.catch(() => {
			navigationManager.cancelPageSwitch()
		})

		return (async () => {
			const topbarBridgePromise = isLandscapePublicLayout
				? (publicTopbarManager
						?.bridgeTo(targetPageState.topbarShellVariant)
						.catch(() => undefined) ?? Promise.resolve())
				: Promise.resolve()

			const exitDurationMs =
				isLandscapePublicLayout && routeState.kind === 'blog'
					? motionTokens.blog.missionExitTotalDurationMs
					: navigationManager.exitDurationMs

			await tick()
			await waitForNextPaint()
			await wait(exitDurationMs)
			if (navigationManager.pendingTarget !== targetPath) {
				return
			}

			navigationManager.startBackgroundBridge({ deferUntilEntry: isLandscapePublicLayout })
			navigationManager.releaseExit()
			await tick()
			if (navigationManager.pendingTarget !== targetPath) {
				return
			}

			if (isLandscapePublicLayout) {
				void topbarBridgePromise
				return
			}

			await Promise.all([wait(navigationManager.bridgeDurationMs), topbarBridgePromise])
		})()
	})

	$effect(() => {
		if (!browser || !data?.i18n?.locale) {
			return
		}

		document.documentElement.lang = data.i18n.locale
		document.documentElement.dataset.locale = data.i18n.locale
	})

	$effect(() => {
		if (!browser) {
			return
		}

		document.documentElement.dataset.siteBootPhase = siteBootPhase
	})

	$effect(() => {
		const nextRouteState = routeState
		const nextPageState = pageState
		const nextLocale = data.i18n?.locale

		untrack(() => {
			navigationManager.sync(nextRouteState, nextPageState, nextLocale)
		})
	})

	$effect(() => {
		if (!browser) {
			return
		}

		document.documentElement.dataset.cursorMode = navigationManager.cursorMode
	})

	$effect(() => {
		if (!browser) {
			return
		}

		if (pageState.motionFamily !== 'main' || !isLandscapePublicLayout) {
			clearDesktopHomeEnterTimer()
			desktopHomeEnterActive = false
		} else if (isRouteEntering) {
			clearDesktopHomeEnterTimer()
			desktopHomeEnterActive = true
			desktopHomeEnterTimer = setTimeout(() => {
				desktopHomeEnterTimer = null
				desktopHomeEnterActive = false
			}, motionTokens.route.desktopHomeEnterDurationMs)
		}
	})

	$effect(() => {
		if (!browser) {
			return
		}

		if (!isPublicScreenRoute || pageState.motionFamily !== 'subpage' || !isLandscapePublicLayout) {
			clearDesktopSubpageEnterTimer()
			desktopSubpageEnterActive = false
			if (pageState.motionFamily === 'main' || !isLandscapePublicLayout) {
				queuedDesktopEnterVariant = 'none'
			}
			return
		}

		if (!isRouteEntering || queuedDesktopEnterVariant !== 'subpage') {
			return
		}

		queuedDesktopEnterVariant = 'none'
		clearDesktopSubpageEnterTimer()
		desktopSubpageEnterActive = true
		desktopSubpageEnterTimer = setTimeout(() => {
			desktopSubpageEnterTimer = null
			desktopSubpageEnterActive = false
		}, motionTokens.route.desktopSubpageEnterDurationMs)
	})

	$effect(() => {
		if (!browser) {
			return
		}

		const toastEligible = isPortraitPublicLayout && siteBootPhase === 'idle'
		if (toastEligible && !portraitOrientationToastWasEligible) {
			showPortraitOrientationToast()
		} else if (!toastEligible) {
			hidePortraitOrientationToastImmediate()
		}

		portraitOrientationToastWasEligible = toastEligible
	})

	onMount(() => {
		navigationManager.hydrateClientRuntime()
		document.addEventListener('dragstart', handleDocumentDragStart)

		const unbindPortrait = bindMediaQuery(portraitQuery, (matches) => {
			publicLayoutMode = matches ? 'portrait' : 'landscape'
		})
		const unbindCoarsePointer = bindMediaQuery(coarsePointerQuery, (matches) => {
			isCoarsePointer = matches
		})
		const unbindReducedMotion = bindMediaQuery(reducedMotionQuery, (matches) => {
			prefersReducedMotion = matches
		})

		if (routeState.kind === 'manage') {
			siteBootPhase = 'idle'

			return () => {
				document.removeEventListener('dragstart', handleDocumentDragStart)
				unbindPortrait()
				unbindCoarsePointer()
				unbindReducedMotion()
			}
		}

		const bootMotionTokens = getMotionTokens({
			portrait: window.matchMedia(portraitQuery).matches,
			reducedMotion: window.matchMedia(reducedMotionQuery).matches
		})
		const bootDurationMs = bootMotionTokens.boot.holdDurationMs
		const entryDurationMs = bootMotionTokens.boot.entryDurationMs
		let isDisposed = false
		let entryTimer: ReturnType<typeof setTimeout> | null = null
		let bootAssetsObserver: MutationObserver | null = null

		const waitForBootAssetsReady = () =>
			new Promise<void>((resolve) => {
				const root = document.documentElement
				if (root.dataset.siteBootAssets === 'ready') {
					resolve()
					return
				}

				bootAssetsObserver = new MutationObserver(() => {
					if (root.dataset.siteBootAssets !== 'ready') {
						return
					}

					bootAssetsObserver?.disconnect()
					bootAssetsObserver = null
					resolve()
				})

				bootAssetsObserver.observe(root, {
					attributes: true,
					attributeFilter: ['data-site-boot-assets']
				})
			})

		void Promise.all([wait(bootDurationMs), waitForBootAssetsReady()]).then(() => {
			if (isDisposed) {
				return
			}

			siteBootPhase = 'entry'
			entryTimer = setTimeout(() => {
				entryTimer = null
				if (!isDisposed) {
					siteBootPhase = 'idle'
				}
			}, entryDurationMs)
		})

		return () => {
			isDisposed = true
			document.removeEventListener('dragstart', handleDocumentDragStart)
			unbindPortrait()
			unbindCoarsePointer()
			unbindReducedMotion()
			bootAssetsObserver?.disconnect()

			if (entryTimer) {
				clearTimeout(entryTimer)
			}
		}
	})
</script>

<SiteShell
	bind:siteFrame
	bind:publicTopbarManager
	{children}
	{messages}
	{siteBootPhase}
	{siteFrameMotionStyle}
	{publicLayoutMode}
	{prefersReducedMotion}
	{pageState}
	{routeState}
	{navigationManager}
	{showBackgroundStage}
	{enableSiteClickEffect}
	{isLandscapePublicLayout}
	{isPortraitPublicLayout}
	{showGlobalChrome}
	{isBareRoute}
	{isPublicScreenRoute}
	{isManageRoute}
	{isRouteEntering}
	{isRouteOutgoing}
	{useDesktopHomeExit}
	{useDesktopBlogExit}
	{desktopHomeEnterActive}
	{desktopSubpageEnterActive}
	{portraitOrientationToastVisible}
	{portraitOrientationToastClosing}
	{portraitOrientationHint}
/>
