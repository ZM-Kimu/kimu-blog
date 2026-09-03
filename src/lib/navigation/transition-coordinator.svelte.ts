import { NavigationBackgroundBridgeRuntime } from './background-bridge-runtime.svelte'
import {
	NavigationPageSwitchRuntime,
	type PageSwitchStartPhase
} from './page-switch-runtime.svelte'
import { resolveTransitionDurations } from './transition-runtime'

import type { BackgroundScene, BeginPageSwitchOptions, PageState, RouteState } from './types'

const defaultTransitionDurations = resolveTransitionDurations({
	options: { origin: 'initial' },
	backgroundScene: 'subpage-room',
	pendingBackgroundScene: 'subpage-room'
})

export class NavigationTransitionCoordinator {
	#pageSwitch: NavigationPageSwitchRuntime
	#backgroundBridge: NavigationBackgroundBridgeRuntime

	constructor(initialRouteState?: RouteState, initialPageState?: PageState) {
		const routeState = initialRouteState ?? {
			kind: 'unknown',
			pathname: '/',
			status: 200,
			isError: false
		}
		const pageState = initialPageState ?? {
			route: routeState,
			title: '',
			transitionKey: 'unknown',
			motionFamily: 'subpage',
			shellMode: 'shell',
			showGlobalChrome: true,
			backgroundScene: 'subpage-room',
			topbarShellVariant: 'none',
			topbar: {
				variant: 'subpage',
				title: '',
				metrics: [],
				actions: []
			}
		}
		this.#pageSwitch = new NavigationPageSwitchRuntime({
			initialRouteState: routeState,
			initialPageState: pageState,
			exitDurationMs: defaultTransitionDurations.exitDurationMs,
			enterDurationMs: defaultTransitionDurations.enterDurationMs
		})
		this.#backgroundBridge = new NavigationBackgroundBridgeRuntime(pageState)
		this.#backgroundBridge.bridgeDurationMs = defaultTransitionDurations.bridgeDurationMs
	}

	get routeState() {
		return this.#pageSwitch.routeState
	}

	get pageState() {
		return this.#pageSwitch.pageState
	}

	get exitingRouteState() {
		return this.#pageSwitch.exitingRouteState
	}

	get exitingPageState() {
		return this.#pageSwitch.exitingPageState
	}

	get pendingTarget() {
		return this.#pageSwitch.pendingTarget
	}

	get pendingPageState() {
		return this.#pageSwitch.pendingPageState
	}

	get phase() {
		return this.#pageSwitch.phase
	}

	get exitDurationMs() {
		return this.#pageSwitch.exitDurationMs
	}

	get enterDurationMs() {
		return this.#pageSwitch.enterDurationMs
	}

	get backgroundScene(): BackgroundScene {
		return this.#backgroundBridge.backgroundScene
	}

	get pendingBackgroundScene(): BackgroundScene | null {
		return this.#backgroundBridge.pendingBackgroundScene
	}

	get backgroundBridgeActive() {
		return this.#backgroundBridge.backgroundBridgeActive
	}

	get bridgeDurationMs() {
		return this.#backgroundBridge.bridgeDurationMs
	}

	sync(routeState: RouteState, pageState: PageState) {
		this.#pageSwitch.sync(routeState, pageState, () => {
			this.#backgroundBridge.activateDeferredBackgroundBridge()
		})

		if (this.phase !== 'idle' && this.pendingTarget === routeState.pathname) {
			this.#backgroundBridge.syncPendingBackgroundScene(pageState)

			if (this.#backgroundBridge.isReadyToFinish) {
				this.finishBackgroundBridge()
			}
		}
	}

	beginPageSwitch(
		targetPath: string,
		targetPageState: PageState,
		options: BeginPageSwitchOptions
	): PageSwitchStartPhase | null {
		const nextBackgroundScene = targetPageState.backgroundScene
		const transitionDurations = resolveTransitionDurations({
			options,
			backgroundScene: this.backgroundScene,
			pendingBackgroundScene: nextBackgroundScene,
			currentRouteState: this.routeState,
			targetPageState
		})

		const startPhase = this.#pageSwitch.beginPageSwitch({
			targetPath,
			targetPageState,
			exitDurationMs: transitionDurations.exitDurationMs,
			enterDurationMs: transitionDurations.enterDurationMs
		})
		if (!startPhase) {
			return null
		}

		if (startPhase === 'entry') {
			this.#backgroundBridge.cancelPageSwitch()
			return startPhase
		}

		this.#backgroundBridge.beginPageSwitch(targetPageState, transitionDurations.bridgeDurationMs)
		return startPhase
	}

	startBackgroundBridge(options?: { deferUntilEntry?: boolean }) {
		this.#backgroundBridge.startBackgroundBridge({
			deferUntilEntry: options?.deferUntilEntry && this.phase === 'exit'
		})
	}

	finishBackgroundBridge() {
		this.#backgroundBridge.finishBackgroundBridge()
	}

	cancelPageSwitch() {
		this.#pageSwitch.cancelPageSwitch()
		this.#backgroundBridge.cancelPageSwitch()
	}

	releaseExit() {
		this.#pageSwitch.releaseExit(() => {
			this.#backgroundBridge.activateDeferredBackgroundBridge()
		})
	}

	destroy() {
		this.#pageSwitch.destroy()
		this.#backgroundBridge.destroy()
	}
}
