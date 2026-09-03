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

export function resolveTransitionDurations(args: {
	options: BeginPageSwitchOptions
	backgroundScene: BackgroundScene
	pendingBackgroundScene: BackgroundScene | null
	currentRouteState?: RouteState
	targetPageState?: PageState
}) {
	const motionTokens = getMotionTokens({
		portrait: args.options.portrait ?? false,
		reducedMotion: args.options.reducedMotion ?? false
	})
	const exitsAbout = args.currentRouteState?.kind === 'about'
	const entersAbout = args.targetPageState?.route.kind === 'about'
	const exitsArchive = args.currentRouteState?.kind === 'archive'
	const entersArchive = args.targetPageState?.route.kind === 'archive'
	const exitsTag = args.currentRouteState?.kind === 'tag'
	const entersTag = args.targetPageState?.route.kind === 'tag'
	const exitsPost = args.currentRouteState?.kind === 'post'
	const entersPost = args.targetPageState?.route.kind === 'post'
	const exitsInfoFlow =
		args.currentRouteState?.kind === 'updates' || args.currentRouteState?.kind === 'favorites'
	const entersInfoFlow =
		args.targetPageState?.route.kind === 'updates' ||
		args.targetPageState?.route.kind === 'favorites'
	const entersBlog = args.targetPageState?.route.kind === 'blog'
	const usesDesktopPublicEntry = !args.options.portrait
	const tagEnterDurationMs = motionTokens.reducedMotion
		? motionTokens.blog.tagListSwapEnterDurationMs
		: motionTokens.route.desktopSubpageEnterDelayMs +
			70 +
			motionTokens.blog.tagListSwapEnterDurationMs

	return {
		exitDurationMs: exitsAbout
			? motionTokens.about.exitDurationMs
			: exitsArchive
				? motionTokens.blog.archiveExitTotalDurationMs
				: exitsTag
					? motionTokens.blog.tagListSwapExitDurationMs
					: exitsPost && usesDesktopPublicEntry
						? motionTokens.blog.postPageExitDurationMs
						: exitsInfoFlow
							? motionTokens.blog.tagListSwapExitDurationMs
							: motionTokens.route.exitDurationMs,
		enterDurationMs: entersAbout
			? motionTokens.about.enterDurationMs
			: entersArchive
				? motionTokens.blog.archiveEnterTotalDurationMs
				: entersTag
					? tagEnterDurationMs
					: entersPost && usesDesktopPublicEntry
						? motionTokens.blog.postPageEnterDurationMs
						: entersBlog && usesDesktopPublicEntry
							? motionTokens.route.desktopSubpageEnterDurationMs
							: entersInfoFlow && args.currentRouteState?.kind === 'home' && usesDesktopPublicEntry
								? motionTokens.route.desktopSubpageEnterDurationMs
								: motionTokens.route.entryDurationMs,
		bridgeDurationMs:
			args.pendingBackgroundScene === args.backgroundScene ? 0 : motionTokens.route.bridgeDurationMs
	}
}
