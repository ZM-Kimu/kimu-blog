import type { BackgroundScene, PageState } from './types'

export class NavigationBackgroundBridgeRuntime {
	backgroundScene = $state<BackgroundScene>('subpage-room')
	pendingBackgroundScene = $state<BackgroundScene | null>(null)
	backgroundBridgeActive = $state(false)
	bridgeDurationMs = $state(0)

	#backgroundBridgeTimer: ReturnType<typeof setTimeout> | null = null
	#backgroundBridgeDeferred = false
	#backgroundBridgeReady = false

	constructor(initialPageState: PageState) {
		this.backgroundScene = initialPageState.backgroundScene
	}

	syncPendingBackgroundScene(pageState: PageState) {
		this.pendingBackgroundScene = pageState.backgroundScene
	}

	beginPageSwitch(targetPageState: PageState, bridgeDurationMs: number) {
		if (this.backgroundBridgeActive) {
			this.finishBackgroundBridge()
		}

		this.#clearBackgroundBridgeTimer()
		this.#backgroundBridgeDeferred = false
		this.#backgroundBridgeReady = false
		this.backgroundBridgeActive = false
		this.pendingBackgroundScene = targetPageState.backgroundScene
		this.bridgeDurationMs = bridgeDurationMs
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

		if (options?.deferUntilEntry) {
			this.#backgroundBridgeDeferred = true
			return
		}

		this.#activateBackgroundBridge()
	}

	activateDeferredBackgroundBridge() {
		if (!this.#backgroundBridgeDeferred) {
			return
		}

		this.#backgroundBridgeDeferred = false
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
		this.#clearBackgroundBridgeTimer()
		this.#backgroundBridgeDeferred = false
		this.#backgroundBridgeReady = false
		this.backgroundBridgeActive = false
		this.pendingBackgroundScene = null
	}

	get isReadyToFinish() {
		return this.#backgroundBridgeReady
	}

	destroy() {
		this.#clearBackgroundBridgeTimer()
	}

	#clearBackgroundBridgeTimer() {
		if (this.#backgroundBridgeTimer === null) {
			return
		}

		clearTimeout(this.#backgroundBridgeTimer)
		this.#backgroundBridgeTimer = null
	}

	#activateBackgroundBridge() {
		this.#clearBackgroundBridgeTimer()
		this.#backgroundBridgeReady = false
		this.backgroundBridgeActive = true
		this.#backgroundBridgeTimer = setTimeout(() => {
			this.#backgroundBridgeTimer = null
			this.#backgroundBridgeReady = true
			this.finishBackgroundBridge()
		}, this.bridgeDurationMs)
	}
}
