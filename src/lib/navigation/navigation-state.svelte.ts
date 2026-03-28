import { browser } from '$app/environment'
import { goto, invalidateAll } from '$app/navigation'
import { resolve } from '$app/paths'
import { DEFAULT_LOCALE, LOCALE_COOKIE, type AppLocale } from '$lib/i18n/config'

import { createPageState } from './page-state'
import { resolveRouteState } from './route-state'

import type {
	BackBehavior,
	BeginPageSwitchOptions,
	PageState,
	RouteState,
	TransitionPhase
} from './types'

function createUnknownRouteState(): RouteState {
	return resolveRouteState({ pathname: '/__unknown__', status: 200 })
}

function createUnknownPageState(): PageState {
	return createPageState({
		routeState: createUnknownRouteState(),
		data: {}
	})
}

export class NavigationStateManager {
	routeState = $state<RouteState>(createUnknownRouteState())
	pageState = $state<PageState>(createUnknownPageState())
	pendingTarget = $state<string | null>(null)
	pendingPageState = $state<PageState | null>(null)
	phase = $state<TransitionPhase>('idle')
	enterDurationMs = $state(260)
	locale = $state<AppLocale>(DEFAULT_LOCALE)
	topbarCollapsed = $state(false)
	settingsOpen = $state(false)
	cursorMode = $state<'custom' | 'system'>('custom')

	#enterTimer: ReturnType<typeof setTimeout> | null = null
	#clientRuntimeHydrated = false

	sync(routeState: RouteState, pageState: PageState, locale?: AppLocale) {
		this.routeState = routeState
		this.pageState = pageState
		this.locale = locale ?? this.locale

		if (this.phase === 'navigating' && this.pendingTarget === routeState.pathname) {
			this.#startEntering()
		}
	}

	beginPageSwitch(
		targetPath: string,
		targetPageState: PageState,
		options: BeginPageSwitchOptions
	): boolean {
		void options.origin

		if (this.phase !== 'idle') {
			return false
		}

		this.#clearEnterTimer()
		this.pendingTarget = targetPath
		this.pendingPageState = targetPageState
		this.enterDurationMs = options.reducedMotion ? 140 : 260
		this.settingsOpen = false
		this.phase = 'exiting'

		return true
	}

	markNavigating() {
		if (this.phase === 'exiting') {
			this.phase = 'navigating'
		}
	}

	cancelPageSwitch() {
		this.#clearEnterTimer()
		this.phase = 'idle'
		this.pendingTarget = null
		this.pendingPageState = null
	}

	hydrateClientRuntime() {
		if (!browser || this.#clientRuntimeHydrated) {
			return
		}

		this.#clientRuntimeHydrated = true

		const savedCursorMode = window.localStorage.getItem('cursor-mode')
		if (savedCursorMode === 'custom' || savedCursorMode === 'system') {
			this.cursorMode = savedCursorMode
		}
	}

	toggleTopbarCollapsed(force?: boolean) {
		const nextValue = force ?? !this.topbarCollapsed
		this.topbarCollapsed = nextValue

		if (nextValue) {
			this.settingsOpen = false
		}
	}

	openTopbarSettings() {
		this.topbarCollapsed = false
		this.settingsOpen = true
	}

	closeTopbarSettings() {
		this.settingsOpen = false
	}

	setCursorMode(mode: 'custom' | 'system') {
		this.cursorMode = mode

		if (browser) {
			window.localStorage.setItem('cursor-mode', mode)
		}
	}

	toggleCursorMode() {
		this.setCursorMode(this.cursorMode === 'custom' ? 'system' : 'custom')
	}

	async toggleLocale() {
		if (!browser) {
			return
		}

		const nextLocale: AppLocale = this.locale === 'zh-CN' ? 'en-US' : 'zh-CN'
		this.settingsOpen = false
		document.cookie = `${LOCALE_COOKIE}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`
		this.locale = nextLocale
		await invalidateAll()
	}

	async goBack(back?: BackBehavior) {
		if (browser && window.history.length > 1) {
			window.history.back()
			return
		}

		if (back?.fallbackHref) {
			await goto(resolve(back.fallbackHref))
		}
	}

	destroy() {
		this.#clearEnterTimer()
	}

	#startEntering() {
		this.#clearEnterTimer()
		this.phase = 'entering'
		this.#enterTimer = setTimeout(() => {
			this.finishEntering()
		}, this.enterDurationMs)
	}

	private finishEntering() {
		this.#clearEnterTimer()
		this.phase = 'idle'
		this.pendingTarget = null
		this.pendingPageState = null
	}

	#clearEnterTimer() {
		if (this.#enterTimer) {
			clearTimeout(this.#enterTimer)
			this.#enterTimer = null
		}
	}
}

export function createNavigationStateManager(
	initialRouteState?: RouteState,
	initialPageState?: PageState
) {
	const manager = new NavigationStateManager()

	if (initialRouteState) {
		manager.routeState = initialRouteState
	}

	if (initialPageState) {
		manager.pageState = initialPageState
	}

	return manager
}
