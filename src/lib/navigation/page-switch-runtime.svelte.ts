import type { PageState, RouteState, TransitionPhase } from './types'

export type PageSwitchStartPhase = 'entry' | 'exit'

export class NavigationPageSwitchRuntime {
	routeState = $state<RouteState>({
		kind: 'unknown',
		pathname: '/',
		status: 200,
		isError: false
	})
	pageState = $state<PageState>({
		route: this.routeState,
		title: '',
		transitionKey: 'unknown',
		motionFamily: 'subpage',
		shellMode: 'shell',
		showGlobalChrome: true,
		backgroundPolicy: 'replace',
		backgroundScene: 'neutral-default',
		topbarShellVariant: 'none',
		topbar: {
			variant: 'subpage',
			title: '',
			metrics: [],
			actions: []
		}
	})
	exitingRouteState = $state<RouteState | null>(null)
	exitingPageState = $state<PageState | null>(null)
	pendingTarget = $state<string | null>(null)
	pendingPageState = $state<PageState | null>(null)
	phase = $state<TransitionPhase>('idle')
	exitDurationMs = $state(0)
	enterDurationMs = $state(0)

	#enterTimer: ReturnType<typeof setTimeout> | null = null
	#exitReleaseRequested = false

	constructor(args: {
		initialRouteState: RouteState
		initialPageState: PageState
		exitDurationMs: number
		enterDurationMs: number
	}) {
		this.routeState = args.initialRouteState
		this.pageState = args.initialPageState
		this.exitDurationMs = args.exitDurationMs
		this.enterDurationMs = args.enterDurationMs
	}

	sync(routeState: RouteState, pageState: PageState, onTargetSynced?: () => void) {
		this.routeState = routeState
		this.pageState = pageState

		if (this.phase !== 'idle' && this.pendingTarget === routeState.pathname) {
			this.pendingPageState = pageState

			if (this.phase === 'exit' && this.#exitReleaseRequested) {
				this.#exitReleaseRequested = false
				this.#startEntry()
				onTargetSynced?.()
			}
		}
	}

	beginPageSwitch(args: {
		targetPath: string
		targetPageState: PageState
		exitDurationMs: number
		enterDurationMs: number
	}): PageSwitchStartPhase | null {
		this.#clearEnterTimer()
		this.#exitReleaseRequested = false
		this.exitDurationMs = args.exitDurationMs
		this.enterDurationMs = args.enterDurationMs

		if (this.phase === 'exit') {
			this.pendingTarget = args.targetPath
			this.pendingPageState = args.targetPageState

			if (args.targetPath === this.routeState.pathname) {
				this.#startEntry()
				return 'entry'
			}

			return 'exit'
		}

		this.exitingRouteState = this.routeState
		this.exitingPageState = this.pageState
		this.pendingTarget = args.targetPath
		this.pendingPageState = args.targetPageState
		this.phase = 'exit'
		return 'exit'
	}

	releaseExit(onReleased?: () => void) {
		if (this.phase !== 'exit') {
			return
		}

		this.#exitReleaseRequested = true

		if (this.pendingTarget !== this.routeState.pathname) {
			return
		}

		this.#exitReleaseRequested = false
		this.#startEntry()
		onReleased?.()
	}

	cancelPageSwitch() {
		this.#clearEnterTimer()
		this.#exitReleaseRequested = false
		this.phase = 'idle'
		this.exitingRouteState = null
		this.exitingPageState = null
		this.pendingTarget = null
		this.pendingPageState = null
	}

	destroy() {
		this.#clearEnterTimer()
	}

	#startEntry() {
		this.#clearEnterTimer()
		this.phase = 'entry'
		this.exitingRouteState = null
		this.exitingPageState = null
		this.#enterTimer = setTimeout(() => {
			this.#finishEntry()
		}, this.enterDurationMs)
	}

	#finishEntry() {
		this.#clearEnterTimer()
		this.phase = 'idle'
		this.pendingTarget = null
		this.pendingPageState = null
		this.#exitReleaseRequested = false
	}

	#clearEnterTimer() {
		if (this.#enterTimer === null) {
			return
		}

		clearTimeout(this.#enterTimer)
		this.#enterTimer = null
	}
}
