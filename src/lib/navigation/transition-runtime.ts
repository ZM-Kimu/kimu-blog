import { getMotionTokens } from '$lib/motion/tokens'

import { createPageState } from './page-state'
import { resolveRouteState } from './route-state'

import type { BeginPageSwitchOptions, BackgroundScene, PageState, RouteState } from './types'

export function createUnknownRouteState(): RouteState {
	return resolveRouteState({ pathname: '/__unknown__', status: 200 })
}

export function createUnknownPageState(): PageState {
	return createPageState({
		routeState: createUnknownRouteState(),
		data: {}
	})
}

export function resolveBackgroundScene(backgroundScene: BackgroundScene, pageState: PageState) {
	if (pageState.backgroundPolicy === 'replace' && pageState.backgroundScene) {
		return pageState.backgroundScene
	}

	return backgroundScene
}

export function resolveTransitionDurations(args: {
	options: BeginPageSwitchOptions
	backgroundScene: BackgroundScene
	pendingBackgroundScene: BackgroundScene | null
}) {
	const motionTokens = getMotionTokens({
		portrait: args.options.portrait ?? false,
		reducedMotion: args.options.reducedMotion ?? false
	})

	return {
		exitDurationMs: motionTokens.route.exitDurationMs,
		enterDurationMs: motionTokens.route.entryDurationMs,
		bridgeDurationMs:
			args.pendingBackgroundScene === args.backgroundScene ? 0 : motionTokens.route.bridgeDurationMs
	}
}
