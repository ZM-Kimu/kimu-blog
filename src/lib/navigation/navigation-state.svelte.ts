import type { AppLocale } from '$lib/i18n/config'

import { NavigationSessionRuntime } from './session-runtime.svelte'
import { NavigationTransitionCoordinator } from './transition-coordinator.svelte'

import type { PageSwitchStartPhase } from './page-switch-runtime.svelte'
import type {
	BackBehavior,
	BackgroundAnimationPreference,
	BackgroundAnimationStatus,
	BeginPageSwitchOptions,
	PageState,
	RouteState
} from './types'

export class NavigationStateManager {
	#transition: NavigationTransitionCoordinator
	#session: NavigationSessionRuntime

	constructor(initialRouteState?: RouteState, initialPageState?: PageState) {
		this.#transition = new NavigationTransitionCoordinator(initialRouteState, initialPageState)
		this.#session = new NavigationSessionRuntime()
	}

	get routeState() {
		return this.#transition.routeState
	}

	get pageState() {
		return this.#transition.pageState
	}

	get exitingRouteState() {
		return this.#transition.exitingRouteState
	}

	get exitingPageState() {
		return this.#transition.exitingPageState
	}

	get pendingTarget() {
		return this.#transition.pendingTarget
	}

	get pendingPageState() {
		return this.#transition.pendingPageState
	}

	get backgroundScene() {
		return this.#transition.backgroundScene
	}

	get pendingBackgroundScene() {
		return this.#transition.pendingBackgroundScene
	}

	get backgroundBridgeActive() {
		return this.#transition.backgroundBridgeActive
	}

	get phase() {
		return this.#transition.phase
	}

	get exitDurationMs() {
		return this.#transition.exitDurationMs
	}

	get bridgeDurationMs() {
		return this.#transition.bridgeDurationMs
	}

	get enterDurationMs() {
		return this.#transition.enterDurationMs
	}

	get locale() {
		return this.#session.locale
	}

	get topbarCollapsed() {
		return this.#session.topbarCollapsed
	}

	get settingsOpen() {
		return this.#session.settingsOpen
	}

	get cursorMode() {
		return this.#session.cursorMode
	}

	get backgroundAnimationPreference() {
		return this.#session.backgroundAnimationPreference
	}

	get backgroundAnimationStatus() {
		return this.#session.backgroundAnimationStatus
	}

	sync(routeState: RouteState, pageState: PageState, locale?: AppLocale) {
		this.#transition.sync(routeState, pageState)
		this.#session.sync(routeState.pathname, locale)
	}

	beginPageSwitch(
		targetPath: string,
		targetPageState: PageState,
		options: BeginPageSwitchOptions
	): PageSwitchStartPhase | null {
		const startPhase = this.#transition.beginPageSwitch(targetPath, targetPageState, options)
		if (startPhase) {
			this.#session.closeTopbarSettings()
		}
		return startPhase
	}

	startBackgroundBridge(options?: { deferUntilEntry?: boolean }) {
		this.#transition.startBackgroundBridge(options)
	}

	finishBackgroundBridge() {
		this.#transition.finishBackgroundBridge()
	}

	cancelPageSwitch() {
		this.#transition.cancelPageSwitch()
	}

	releaseExit() {
		this.#transition.releaseExit()
	}

	hydrateClientRuntime() {
		this.#session.hydrateClientRuntime(this.routeState.pathname)
	}

	toggleTopbarCollapsed(force?: boolean) {
		this.#session.toggleTopbarCollapsed(force)
	}

	openTopbarSettings() {
		this.#session.openTopbarSettings()
	}

	closeTopbarSettings() {
		this.#session.closeTopbarSettings()
	}

	setCursorMode(mode: 'custom' | 'system') {
		this.#session.setCursorMode(mode)
	}

	setBackgroundAnimationPreference(mode: BackgroundAnimationPreference) {
		this.#session.setBackgroundAnimationPreference(mode)
	}

	setBackgroundAnimationStatus(status: BackgroundAnimationStatus) {
		this.#session.setBackgroundAnimationStatus(status)
	}

	toggleCursorMode() {
		this.#session.toggleCursorMode()
	}

	async toggleLocale() {
		await this.#session.toggleLocale()
	}

	async goBack(back?: BackBehavior) {
		await this.#session.goBack(this.routeState.pathname, back)
	}

	destroy() {
		this.#transition.destroy()
	}
}

export function createNavigationStateManager(
	initialRouteState?: RouteState,
	initialPageState?: PageState
) {
	return new NavigationStateManager(initialRouteState, initialPageState)
}
