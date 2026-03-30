import { browser } from '$app/environment'
import { goto, invalidateAll } from '$app/navigation'
import { resolve } from '$app/paths'
import { DEFAULT_LOCALE, LOCALE_COOKIE, type AppLocale } from '$lib/i18n/config'

import { createPageState } from './page-state'
import { resolveRouteState } from './route-state'

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

const CURSOR_MODE_STORAGE_KEY = 'cursor-mode'
const BACKGROUND_ANIMATION_STORAGE_KEY = 'home-background-animation'

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
	backgroundScene = $state<BackgroundScene>('neutral-default')
	pendingBackgroundScene = $state<BackgroundScene | null>(null)
	backgroundBridgeActive = $state(false)
	phase = $state<TransitionPhase>('idle')
	exitDurationMs = $state(120)
	bridgeDurationMs = $state(180)
	enterDurationMs = $state(160)
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
	#clientRuntimeHydrated = false
	#appHistoryEntryIds: string[] = []
	#appHistoryCursor = -1

	#resolveBackgroundScene(pageState: PageState) {
		if (pageState.backgroundPolicy === 'replace' && pageState.backgroundScene) {
			return pageState.backgroundScene
		}

		return this.backgroundScene
	}

	sync(routeState: RouteState, pageState: PageState, locale?: AppLocale) {
		this.routeState = routeState
		this.pageState = pageState
		this.locale = locale ?? this.locale
		this.#syncClientHistoryCursor()

		if (this.phase !== 'idle' && this.pendingTarget === routeState.pathname) {
			this.pendingPageState = pageState
			this.pendingBackgroundScene = this.#resolveBackgroundScene(pageState)

			if (this.phase === 'exiting') {
				this.#startEntering()
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
		this.backgroundBridgeActive = false
		this.pendingTarget = targetPath
		this.pendingPageState = targetPageState
		this.pendingBackgroundScene = this.#resolveBackgroundScene(targetPageState)
		this.exitDurationMs = options.reducedMotion ? 60 : 120
		this.enterDurationMs = options.reducedMotion ? 80 : 160
		this.bridgeDurationMs =
			options.reducedMotion || this.pendingBackgroundScene === this.backgroundScene
				? 0
				: 180
		this.settingsOpen = false
		this.phase = 'exiting'

		return true
	}

	startBackgroundBridge(options?: { deferUntilEntering?: boolean }) {
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

		if (options?.deferUntilEntering && this.phase === 'exiting') {
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
		this.backgroundBridgeActive = false
		this.phase = 'idle'
		this.pendingTarget = null
		this.pendingPageState = null
		this.pendingBackgroundScene = null
	}

	hydrateClientRuntime() {
		if (!browser || this.#clientRuntimeHydrated) {
			return
		}

		this.#clientRuntimeHydrated = true
		this.#seedClientHistoryCursor()

		const savedCursorMode = window.localStorage.getItem(CURSOR_MODE_STORAGE_KEY)
		if (savedCursorMode === 'custom' || savedCursorMode === 'system') {
			this.cursorMode = savedCursorMode
		}

		const savedBackgroundAnimationPreference = window.localStorage.getItem(
			BACKGROUND_ANIMATION_STORAGE_KEY
		)
		if (
			savedBackgroundAnimationPreference === 'on' ||
			savedBackgroundAnimationPreference === 'off'
		) {
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
			window.localStorage.setItem(CURSOR_MODE_STORAGE_KEY, mode)
		}
	}

	setBackgroundAnimationPreference(mode: BackgroundAnimationPreference) {
		this.backgroundAnimationPreference = mode
		this.backgroundAnimationStatus = 'idle'

		if (browser) {
			window.localStorage.setItem(BACKGROUND_ANIMATION_STORAGE_KEY, mode)
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
		if (browser && this.#appHistoryCursor > 0) {
			window.history.back()
			return
		}

		if (back?.fallbackHref) {
			await goto(resolve(back.fallbackHref))
		}
	}

	destroy() {
		this.#clearEnterTimer()
		this.#clearBackgroundBridgeTimer()
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
				this.phase === 'entering' ||
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
		const currentEntryId = this.#readClientHistoryEntryId()
		if (currentEntryId === null) {
			return
		}

		this.#appHistoryEntryIds = [currentEntryId]
		this.#appHistoryCursor = 0
	}

	#syncClientHistoryCursor() {
		if (!browser || !this.#clientRuntimeHydrated) {
			return
		}

		const currentEntryId = this.#readClientHistoryEntryId()
		if (currentEntryId === null) {
			return
		}

		const existingIndex = this.#appHistoryEntryIds.indexOf(currentEntryId)
		if (existingIndex >= 0) {
			this.#appHistoryCursor = existingIndex
			return
		}

		const nextEntries = this.#appHistoryEntryIds.slice(0, this.#appHistoryCursor + 1)
		nextEntries.push(currentEntryId)
		this.#appHistoryEntryIds = nextEntries
		this.#appHistoryCursor = nextEntries.length - 1
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
