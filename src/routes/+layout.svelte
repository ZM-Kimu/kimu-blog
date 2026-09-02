<script lang="ts">
	import { onNavigate } from '$app/navigation'
	import { page } from '$app/state'
	import { untrack } from 'svelte'
	import '$lib/../app.css'

	import SiteShell from '$lib/components/layout/SiteShell.svelte'
	import { musicPlaylist } from '$lib/generated/music-playlist'
	import {
		orchestrateNavigationTransition,
		prepareNavigationTransition
	} from '$lib/layout/navigation-flow'
	import { setPublicLayoutContext } from '$lib/layout/public-layout'
	import { bindSiteDocumentState, bindSiteRuntimeEffects } from '$lib/layout/site-bindings.svelte'
	import { createSiteShellState } from '$lib/layout/site-shell-state.svelte'
	import { createSiteLayoutRuntime } from '$lib/layout/site-runtime.svelte'
	import { setMusicPlayerContext } from '$lib/music/context'
	import { createMusicPlayerController } from '$lib/music/music-player.svelte'
	import { setNavigationContext } from '$lib/navigation/context'
	import { createNavigationStateManager } from '$lib/navigation/navigation-state.svelte'
	import { createPageState } from '$lib/navigation/page-state'
	import { resolveRouteState } from '$lib/navigation/route-state'
	import type { TopbarShellVariant } from '$lib/navigation/types'

	type PublicTopbarManagerHandle = {
		bridgeTo: (
			targetShellVariant: TopbarShellVariant,
			options?: { immediate?: boolean }
		) => Promise<void>
	}

	let { children, data } = $props()
	let siteFrame: HTMLDivElement | null = $state(null)
	let publicTopbarManager: PublicTopbarManagerHandle | null = $state(null)

	const siteRuntime = createSiteLayoutRuntime(page.url.pathname)
	const musicPlayer = createMusicPlayerController(musicPlaylist)
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
	setMusicPlayerContext({ musicPlayer })
	setPublicLayoutContext({
		getMode: () => siteRuntime.publicLayoutMode
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
	const shellState = createSiteShellState({
		getMessages: () => messages,
		getRouteState: () => routeState,
		getPageState: () => pageState,
		navigationManager,
		siteRuntime
	})

	bindSiteDocumentState({
		getLocale: () => data.i18n?.locale,
		getSiteBootPhase: () => siteRuntime.siteBootPhase,
		getCursorMode: () => navigationManager.cursorMode
	})

	bindSiteRuntimeEffects({
		getRouteState: () => routeState,
		getPageState: () => pageState,
		getLocale: () => data.i18n?.locale,
		getIsLandscapePublicLayout: () => shellState.isLandscapePublicLayout,
		getIsPortraitPublicLayout: () => shellState.isPortraitPublicLayout,
		getIsPublicScreenRoute: () => shellState.isPublicScreenRoute,
		getIsRouteEntering: () => shellState.isRouteEntering,
		getMotionTokens: () => shellState.motionTokens,
		navigationManager,
		siteRuntime
	})

	onNavigate((navigation) => {
		if (!navigation.willUnload && navigation.to?.url.pathname === '/') {
			musicPlayer.activateHome()
		}

		const prepared = prepareNavigationTransition({
			navigation,
			currentPathname: page.url.pathname,
			data,
			messages,
			pageState,
			navigationManager,
			isLandscapePublicLayout: shellState.isLandscapePublicLayout,
			isPortraitPublicLayout: shellState.isPortraitPublicLayout,
			reducedMotion: siteRuntime.prefersReducedMotion
		})
		if (!prepared) {
			return
		}

		siteRuntime.prepareNavigation(prepared.queueDesktopSubpageEnter)

		return orchestrateNavigationTransition({
			currentRouteState: routeState,
			targetPath: prepared.targetPath,
			targetPageState: prepared.targetPageState,
			startPhase: prepared.startPhase,
			navigationManager,
			publicTopbarManager,
			isLandscapePublicLayout: shellState.isLandscapePublicLayout,
			motionTokens: shellState.motionTokens
		})
	})
</script>

<SiteShell
	bind:siteFrame
	bind:publicTopbarManager
	{children}
	{messages}
	siteBootPhase={siteRuntime.siteBootPhase}
	siteFrameMotionStyle={shellState.siteFrameMotionStyle}
	publicLayoutMode={siteRuntime.publicLayoutMode}
	prefersReducedMotion={siteRuntime.prefersReducedMotion}
	{pageState}
	{routeState}
	{navigationManager}
	{musicPlayer}
	showBackgroundStage={shellState.showBackgroundStage}
	enableSiteClickEffect={shellState.enableSiteClickEffect}
	isLandscapePublicLayout={shellState.isLandscapePublicLayout}
	isPortraitPublicLayout={shellState.isPortraitPublicLayout}
	showGlobalChrome={shellState.showGlobalChrome}
	isBareRoute={shellState.isBareRoute}
	isPublicScreenRoute={shellState.isPublicScreenRoute}
	isManageRoute={shellState.isManageRoute}
	isRouteEntering={shellState.isRouteEntering}
	isRouteOutgoing={shellState.isRouteOutgoing}
	useDesktopHomeExit={shellState.useDesktopHomeExit}
	useDesktopBlogExit={shellState.useDesktopBlogExit}
	useDesktopPostExit={shellState.useDesktopPostExit}
	desktopHomeEnterActive={siteRuntime.desktopHomeEnterActive}
	desktopSubpageEnterActive={siteRuntime.desktopSubpageEnterActive}
	portraitOrientationToastVisible={siteRuntime.portraitOrientationToastVisible}
	portraitOrientationToastClosing={siteRuntime.portraitOrientationToastClosing}
	portraitOrientationHint={shellState.portraitOrientationHint}
/>
