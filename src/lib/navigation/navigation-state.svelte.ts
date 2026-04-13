import { browser } from '$app/environment'
import { goto, invalidateAll } from '$app/navigation'
import { resolve } from '$app/paths'
import { DEFAULT_LOCALE, LOCALE_COOKIE, type AppLocale } from '$lib/i18n/config'

import { AppHistoryTracker } from './app-history'
import {
	persistBackgroundAnimationPreference,
	persistCursorMode,
	readStoredBackgroundAnimationPreference,
	readStoredCursorMode
} from './runtime-preferences'
import {
	createUnknownPageState,
	createUnknownRouteState,
	resolveBackgroundScene,
	resolveTransitionDurations
} from './transition-runtime'

import type {
	BackBehavior,
	BackgroundScene,
	BackgroundAnimationPreference,
	BackgroundAnimationStatus,
	BeginPageSwitchOptions,
	PageState,
	RouteState,
	TransitionPhase
} from './types'

const defaultTransitionDurations = resolveTransitionDurations({
	options: { origin: 'initial' },
	backgroundScene: 'neutral-default',
	pendingBackgroundScene: 'neutral-default'
})

export class NavigationStateManager {
	routeState = $state<RouteState>(createUnknownRouteState())
	pageState = $state<PageState>(createUnknownPageState())
	exitingRouteState = $state<RouteState | null>(null)
	exitingPageState = $state<PageState | null>(null)
	pendingTarget = $state<string | null>(null)
	pendingPageState = $state<PageState | null>(null)
	backgroundScene = $state<BackgroundScene>('neutral-default')
	pendingBackgroundScene = $state<BackgroundScene | null>(null)
	backgroundBridgeActive = $state(false)
	phase = $state<TransitionPhase>('idle')
	exitDurationMs = $state(defaultTransitionDurations.exitDurationMs)
	bridgeDurationMs = $state(defaultTransitionDurations.bridgeDurationMs)
	enterDurationMs = $state(defaultTransitionDurations.enterDurationMs)
	locale = $state<AppLocale>(DEFAULT_LOCALE)
	topbarCollapsed = $state(false)
	settingsOpen = $state(false)
	cursorMode = $state<'custom' | 'system'>('custom')
	backgroundAnimationPreference = $state<BackgroundAnimationPreference>('on')
	backgroundAnimationStatus = $state<BackgroundAnimationStatus>('idle')

	#enterTimer: ReturnType<typeof setTimeout> | null = null
	#backgroundBridgeTimer: ReturnType<typeof setTimeout> | null = null
	#backgroundBridgeDeferred = false
	#backgroundBridgeReady = false
	#exitReleaseRequested = false
	#clientRuntimeHydrated = false
	#historyTracker = new AppHistoryTracker()

	sync(routeState: RouteState, pageState: PageState, locale?: AppLocale) {
		this.routeState = routeState
		this.pageState = pageState
		this.locale = locale ?? this.locale
		this.#syncClientHistoryCursor()

		if (this.phase !== 'idle' && this.pendingTarget === routeState.pathname) {
			this.pendingPageState = pageState
			this.pendingBackgroundScene = resolveBackgroundScene(this.backgroundScene, pageState)

			if (this.phase === 'exit' && this.#exitReleaseRequested) {
				this.#exitReleaseRequested = false
				this.#startEntry()
				this.#activateDeferredBackgroundBridge()
			}

			if (this.#backgroundBridgeReady) {
				this.finishBackgroundBridge()
			}
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

		if (this.backgroundBridgeActive) {
			this.finishBackgroundBridge()
		}

		this.#clearEnterTimer()
		this.#clearBackgroundBridgeTimer()
		this.#backgroundBridgeDeferred = false
		this.#backgroundBridgeReady = false
		this.#exitReleaseRequested = false
		this.backgroundBridgeActive = false
		this.exitingRouteState = this.routeState
		this.exitingPageState = this.pageState
		this.pendingTarget = targetPath
		this.pendingPageState = targetPageState
		this.pendingBackgroundScene = resolveBackgroundScene(this.backgroundScene, targetPageState)
		const transitionDurations = resolveTransitionDurations({
			options,
			backgroundScene: this.backgroundScene,
			pendingBackgroundScene: this.pendingBackgroundScene
		})
		this.exitDurationMs = transitionDurations.exitDurationMs
		this.enterDurationMs = transitionDurations.enterDurationMs
		this.bridgeDurationMs = transitionDurations.bridgeDurationMs
		this.settingsOpen = false
		this.phase = 'exit'

		return true
	}

	startBackgroundBridge(options?: { deferUntilEntry?: boolean }) {
		this.#clearBackgroundBridgeTimer()
		this.#backgroundBridgeDeferred = false
		this.#backgroundBridgeReady = false

		if (
			this.pendingBackgroundScene === null ||
			this.pendingBackgroundScene === this.backgroundScene ||
			this.bridgeDurationMs <= 0
		) {
			this.finishBackgroundBridge()
			return
		}

		if (options?.deferUntilEntry && this.phase === 'exit') {
			this.#backgroundBridgeDeferred = true
			return
		}

		this.#activateBackgroundBridge()
	}

	finishBackgroundBridge() {
		this.#clearBackgroundBridgeTimer()
		this.#backgroundBridgeDeferred = false
		this.#backgroundBridgeReady = false

		if (this.pendingBackgroundScene) {
			this.backgroundScene = this.pendingBackgroundScene
			this.pendingBackgroundScene = null
		}

		this.backgroundBridgeActive = false
	}

	cancelPageSwitch() {
		this.#clearEnterTimer()
		this.#clearBackgroundBridgeTimer()
		this.#backgroundBridgeDeferred = false
		this.#backgroundBridgeReady = false
		this.#exitReleaseRequested = false
		this.backgroundBridgeActive = false
		this.phase = 'idle'
		this.exitingRouteState = null
		this.exitingPageState = null
		this.pendingTarget = null
		this.pendingPageState = null
		this.pendingBackgroundScene = null
	}

	releaseExit() {
		if (this.phase !== 'exit') {
			return
		}

		this.#exitReleaseRequested = true

		if (this.pendingTarget !== this.routeState.pathname) {
			return
		}

		this.#exitReleaseRequested = false
		this.#startEntry()
		this.#activateDeferredBackgroundBridge()
	}

	hydrateClientRuntime() {
		if (!browser || this.#clientRuntimeHydrated) {
			return
		}

		this.#clientRuntimeHydrated = true
		this.#seedClientHistoryCursor()

		const savedCursorMode = readStoredCursorMode(window.localStorage)
		if (savedCursorMode) {
			this.cursorMode = savedCursorMode
		}

		const savedBackgroundAnimationPreference = readStoredBackgroundAnimationPreference(
			window.localStorage
		)
		if (savedBackgroundAnimationPreference) {
			this.backgroundAnimationPreference = savedBackgroundAnimationPreference
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
			persistCursorMode(window.localStorage, mode)
		}
	}

	setBackgroundAnimationPreference(mode: BackgroundAnimationPreference) {
		this.backgroundAnimationPreference = mode
		this.backgroundAnimationStatus = 'idle'

		if (browser) {
			persistBackgroundAnimationPreference(window.localStorage, mode)
		}
	}

	setBackgroundAnimationStatus(status: BackgroundAnimationStatus) {
		this.backgroundAnimationStatus = status
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
		if (browser) {
			const historyDelta = this.#historyTracker.getPreviousPathDelta(this.routeState.pathname)
			if (historyDelta !== null) {
				window.history.go(historyDelta)
				return
			}
		}

		if (back?.fallbackHref) {
			await goto(resolve(back.fallbackHref))
		}
	}

	destroy() {
		this.#clearEnterTimer()
		this.#clearBackgroundBridgeTimer()
	}

	#startEntry() {
		this.#clearEnterTimer()
		this.phase = 'entry'
		this.exitingRouteState = null
		this.exitingPageState = null
		this.#enterTimer = setTimeout(() => {
			this.finishEntry()
		}, this.enterDurationMs)
	}

	private finishEntry() {
		this.#clearEnterTimer()
		this.phase = 'idle'
		this.pendingTarget = null
		this.pendingPageState = null
		this.#exitReleaseRequested = false
	}

	#clearEnterTimer() {
		if (this.#enterTimer) {
			clearTimeout(this.#enterTimer)
			this.#enterTimer = null
		}
	}

	#clearBackgroundBridgeTimer() {
		if (this.#backgroundBridgeTimer) {
			clearTimeout(this.#backgroundBridgeTimer)
			this.#backgroundBridgeTimer = null
		}
	}

	#activateDeferredBackgroundBridge() {
		if (!this.#backgroundBridgeDeferred) {
			return
		}

		this.#backgroundBridgeDeferred = false
		this.#activateBackgroundBridge()
	}

	#activateBackgroundBridge() {
		this.#clearBackgroundBridgeTimer()
		this.#backgroundBridgeReady = false
		this.backgroundBridgeActive = true
		this.#backgroundBridgeTimer = setTimeout(() => {
			this.#clearBackgroundBridgeTimer()
			this.#backgroundBridgeReady = true

			if (
				this.pendingTarget === this.routeState.pathname ||
				this.phase === 'entry' ||
				this.phase === 'idle'
			) {
				this.finishBackgroundBridge()
			}
		}, this.bridgeDurationMs)
	}

	#readClientHistoryEntryId() {
		if (!browser) {
			return null
		}

		const entryId = window.history.state?.['sveltekit:history']
		return typeof entryId === 'string' || typeof entryId === 'number' ? String(entryId) : null
	}

	#seedClientHistoryCursor() {
		this.#historyTracker.seed(this.#readClientHistoryEntryId(), this.routeState.pathname)
	}

	#syncClientHistoryCursor() {
		if (!browser || !this.#clientRuntimeHydrated) {
			return
		}

		this.#historyTracker.sync(this.#readClientHistoryEntryId(), this.routeState.pathname)
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
		manager.backgroundScene =
			initialPageState.backgroundPolicy === 'replace' && initialPageState.backgroundScene
				? initialPageState.backgroundScene
				: 'neutral-default'
	}

	return manager
}
