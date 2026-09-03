import { translate, type LocaleMessages } from '$lib/i18n'
import type { NavigationStateManager } from '$lib/navigation/navigation-state.svelte'
import type { PageState, RouteState } from '$lib/navigation/types'
import { getMotionTokens } from '$lib/motion/tokens'

import type { SiteLayoutRuntime } from './site-runtime.svelte'

type Getter<T> = () => T

export function createSiteShellState(args: {
	getMessages: Getter<LocaleMessages | undefined>
	getRouteState: Getter<RouteState>
	getPageState: Getter<PageState>
	navigationManager: NavigationStateManager
	siteRuntime: SiteLayoutRuntime
}) {
	const isManageRoute = $derived(args.getRouteState().kind === 'manage')
	const isManageInteractionRoute = $derived(
		args.getRouteState().kind === 'manage' || args.getRouteState().kind === 'debugManage'
	)
	const isPublicScreenRoute = $derived(args.getPageState().shellMode === 'screen' && !isManageRoute)
	const isPortraitPublicLayout = $derived(
		isPublicScreenRoute && args.siteRuntime.publicLayoutMode === 'portrait'
	)
	const isLandscapePublicLayout = $derived(!isPortraitPublicLayout)
	const isBareRoute = $derived(isPublicScreenRoute || isManageRoute)
	const showGlobalChrome = $derived(args.getPageState().showGlobalChrome)
	const isRouteOutgoing = $derived(args.navigationManager.phase === 'exit')
	const exitingRouteState = $derived(args.navigationManager.exitingRouteState)
	const useDesktopHomeExit = $derived(
		isRouteOutgoing && exitingRouteState?.kind === 'home' && isLandscapePublicLayout
	)
	const useDesktopBlogExit = $derived(
		isRouteOutgoing && exitingRouteState?.kind === 'blog' && isLandscapePublicLayout
	)
	const useDesktopPostExit = $derived(
		isRouteOutgoing && exitingRouteState?.kind === 'post' && isLandscapePublicLayout
	)
	const isRouteEntering = $derived(
		args.navigationManager.phase === 'entry' &&
			args.navigationManager.pendingTarget === args.getRouteState().pathname
	)
	const showBackgroundStage = $derived(
		isBareRoute ||
			args.navigationManager.phase !== 'idle' ||
			args.navigationManager.pendingBackgroundScene !== null
	)
	const enableSiteClickEffect = $derived(
		!isManageInteractionRoute &&
			!args.siteRuntime.prefersReducedMotion &&
			args.siteRuntime.siteBootPhase !== 'boot'
	)
	const motionTokens = $derived(
		getMotionTokens({
			portrait: isPortraitPublicLayout,
			reducedMotion: args.siteRuntime.prefersReducedMotion
		})
	)
	const portraitOrientationHint = $derived(
		translate(
			args.getMessages(),
			args.siteRuntime.isCoarsePointer ? 'shell.portraitHint.mobile' : 'shell.portraitHint.desktop'
		)
	)
	const siteFrameMotionStyle = $derived(args.siteRuntime.getSiteFrameMotionStyle(motionTokens))

	return {
		get isManageRoute() {
			return isManageRoute
		},
		get isPublicScreenRoute() {
			return isPublicScreenRoute
		},
		get isPortraitPublicLayout() {
			return isPortraitPublicLayout
		},
		get isLandscapePublicLayout() {
			return isLandscapePublicLayout
		},
		get isBareRoute() {
			return isBareRoute
		},
		get showGlobalChrome() {
			return showGlobalChrome
		},
		get isRouteOutgoing() {
			return isRouteOutgoing
		},
		get useDesktopHomeExit() {
			return useDesktopHomeExit
		},
		get useDesktopBlogExit() {
			return useDesktopBlogExit
		},
		get useDesktopPostExit() {
			return useDesktopPostExit
		},
		get isRouteEntering() {
			return isRouteEntering
		},
		get showBackgroundStage() {
			return showBackgroundStage
		},
		get enableSiteClickEffect() {
			return enableSiteClickEffect
		},
		get motionTokens() {
			return motionTokens
		},
		get portraitOrientationHint() {
			return portraitOrientationHint
		},
		get siteFrameMotionStyle() {
			return siteFrameMotionStyle
		}
	}
}
