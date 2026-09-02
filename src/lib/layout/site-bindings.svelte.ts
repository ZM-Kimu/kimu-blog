import { browser } from '$app/environment'
import { onMount } from 'svelte'
import { untrack } from 'svelte'

import type { AppLocale } from '$lib/i18n/config'
import type { NavigationStateManager } from '$lib/navigation/navigation-state.svelte'
import type { PageState, RouteState } from '$lib/navigation/types'
import type { MotionTokens } from '$lib/motion/tokens'

import type { SiteBootPhase, SiteLayoutRuntime } from './site-runtime.svelte'

type Getter<T> = () => T

export function bindSiteDocumentState(args: {
	getLocale: Getter<AppLocale | undefined>
	getSiteBootPhase: Getter<SiteBootPhase>
	getCursorMode: Getter<'custom' | 'system'>
}) {
	$effect(() => {
		if (!browser) {
			return
		}

		const locale = args.getLocale()
		if (!locale) {
			return
		}

		document.documentElement.lang = locale
		document.documentElement.dataset.locale = locale
	})

	$effect(() => {
		if (!browser) {
			return
		}

		document.documentElement.dataset.siteBootPhase = args.getSiteBootPhase()
	})

	$effect(() => {
		if (!browser) {
			return
		}

		document.documentElement.dataset.cursorMode = args.getCursorMode()
	})
}

export function bindSiteRuntimeEffects(args: {
	getRouteState: Getter<RouteState>
	getPageState: Getter<PageState>
	getLocale: Getter<AppLocale | undefined>
	getIsLandscapePublicLayout: Getter<boolean>
	getIsPortraitPublicLayout: Getter<boolean>
	getIsPublicScreenRoute: Getter<boolean>
	getIsRouteEntering: Getter<boolean>
	getMotionTokens: Getter<MotionTokens>
	navigationManager: NavigationStateManager
	siteRuntime: SiteLayoutRuntime
}) {
	$effect(() => {
		const nextRouteState = args.getRouteState()
		const nextPageState = args.getPageState()
		const nextLocale = args.getLocale()

		untrack(() => {
			args.navigationManager.sync(nextRouteState, nextPageState, nextLocale)
		})
	})

	$effect(() => {
		args.siteRuntime.syncDesktopHomeEnter({
			pageMotionFamily: args.getPageState().motionFamily,
			isLandscapePublicLayout: args.getIsLandscapePublicLayout(),
			isRouteEntering: args.getIsRouteEntering(),
			motionTokens: args.getMotionTokens()
		})
	})

	$effect(() => {
		args.siteRuntime.syncDesktopSubpageEnter({
			isPublicScreenRoute: args.getIsPublicScreenRoute(),
			pageMotionFamily: args.getPageState().motionFamily,
			isLandscapePublicLayout: args.getIsLandscapePublicLayout(),
			isRouteEntering: args.getIsRouteEntering(),
			motionTokens: args.getMotionTokens()
		})
	})

	$effect(() => {
		args.siteRuntime.syncPortraitOrientationToast({
			isPortraitPublicLayout: args.getIsPortraitPublicLayout(),
			motionTokens: args.getMotionTokens()
		})
	})

	onMount(() => {
		return args.siteRuntime.mount({
			routeState: args.getRouteState(),
			navigationManager: args.navigationManager
		})
	})
}
