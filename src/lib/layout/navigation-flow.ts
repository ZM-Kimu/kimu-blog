import { tick } from 'svelte'

import type { LocaleMessages } from '$lib/i18n'
import { createPageState } from '$lib/navigation/page-state'
import type { NavigationStateManager } from '$lib/navigation/navigation-state.svelte'
import type { PageSwitchStartPhase } from '$lib/navigation/page-switch-runtime.svelte'
import { resolveRouteState } from '$lib/navigation/route-state'
import type { MotionTokens } from '$lib/motion/tokens'
import type { PageState, RouteState, TopbarShellVariant } from '$lib/navigation/types'

type PendingNavigation = {
	willUnload: boolean
	to: { url: URL } | null
	complete: Promise<void>
	type: string
}

type PublicTopbarManagerHandle = {
	bridgeTo: (targetShellVariant: TopbarShellVariant) => Promise<void>
}

export function resolvePreviewRouteState(pathname: string) {
	const previewStatus =
		pathname === '/__debug/error-404' ? 404 : pathname === '/__debug/error-500' ? 500 : 200
	const previewRouteState = resolveRouteState({
		pathname,
		status: previewStatus
	})

	if (previewRouteState.kind !== 'unknown') {
		return previewRouteState
	}

	return resolveRouteState({
		pathname,
		status: 404
	})
}

export function createPreviewPageState(args: {
	pathname: string
	data: Record<string, unknown>
	messages?: LocaleMessages
}) {
	const routeState = resolvePreviewRouteState(args.pathname)
	const pageState = createPageState({
		routeState,
		data: args.data,
		messages: args.messages
	})

	return { routeState, pageState }
}

export function wait(durationMs: number) {
	if (durationMs <= 0) {
		return Promise.resolve()
	}

	return new Promise<void>((resolvePromise) => {
		setTimeout(resolvePromise, durationMs)
	})
}

export function waitForNextPaint() {
	return new Promise<void>((resolvePromise) => {
		requestAnimationFrame(() => resolvePromise())
	})
}

export function prepareNavigationTransition(args: {
	navigation: PendingNavigation
	currentPathname: string
	data: Record<string, unknown>
	messages?: LocaleMessages
	pageState: PageState
	navigationManager: NavigationStateManager
	isLandscapePublicLayout: boolean
	isPortraitPublicLayout: boolean
	reducedMotion: boolean
}) {
	if (args.navigation.willUnload || !args.navigation.to?.url) {
		return null
	}

	const targetPath = args.navigation.to.url.pathname
	const reversesActiveExit =
		args.navigationManager.phase === 'exit' &&
		targetPath === args.navigationManager.routeState.pathname
	if (targetPath === args.currentPathname && !reversesActiveExit) {
		return null
	}

	const { routeState: targetRouteState, pageState: targetPageState } = createPreviewPageState({
		pathname: targetPath,
		data: args.data,
		messages: args.messages
	})

	const isIntraPostNavigation =
		args.pageState.route.kind === 'post' && targetRouteState.kind === 'post'
	if (isIntraPostNavigation) {
		return null
	}

	const startPhase = args.navigationManager.beginPageSwitch(targetPath, targetPageState, {
		origin: `navigate:${args.navigation.type}`,
		portrait: args.isPortraitPublicLayout,
		reducedMotion: args.reducedMotion
	})

	if (!startPhase) {
		return null
	}

	void args.navigation.complete.catch(() => {
		args.navigationManager.cancelPageSwitch()
	})

	return {
		targetPath,
		targetRouteState,
		targetPageState,
		startPhase,
		queueDesktopSubpageEnter:
			startPhase === 'exit' &&
			args.isLandscapePublicLayout &&
			args.pageState.motionFamily === 'main' &&
			targetPageState.shellMode === 'screen' &&
			targetRouteState.kind !== 'manage' &&
			targetPageState.motionFamily === 'subpage'
	}
}

export async function orchestrateNavigationTransition(args: {
	currentRouteState: RouteState
	targetPath: string
	targetPageState: PageState
	startPhase: PageSwitchStartPhase
	navigationManager: NavigationStateManager
	publicTopbarManager: PublicTopbarManagerHandle | null
	isLandscapePublicLayout: boolean
	motionTokens: MotionTokens
}) {
	const topbarBridgePromise = args.isLandscapePublicLayout
		? (args.publicTopbarManager
				?.bridgeTo(args.targetPageState.topbarShellVariant)
				.catch(() => undefined) ?? Promise.resolve())
		: Promise.resolve()

	if (args.startPhase === 'entry') {
		await tick()
		await waitForNextPaint()
		if (args.navigationManager.pendingTarget !== args.targetPath) {
			return
		}

		await wait(args.navigationManager.enterDurationMs)
		return
	}

	const exitDurationMs =
		args.isLandscapePublicLayout && args.currentRouteState.kind === 'blog'
			? args.motionTokens.blog.missionExitTotalDurationMs
			: args.navigationManager.exitDurationMs

	await tick()
	await waitForNextPaint()
	await wait(exitDurationMs)
	if (args.navigationManager.pendingTarget !== args.targetPath) {
		return
	}

	args.navigationManager.startBackgroundBridge({ deferUntilEntry: args.isLandscapePublicLayout })
	args.navigationManager.releaseExit()
	await tick()
	if (args.navigationManager.pendingTarget !== args.targetPath) {
		return
	}

	if (args.isLandscapePublicLayout) {
		void topbarBridgePromise
		return
	}

	await Promise.all([wait(args.navigationManager.bridgeDurationMs), topbarBridgePromise])
}
