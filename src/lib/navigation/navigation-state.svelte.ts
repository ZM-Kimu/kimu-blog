import { browser } from '$app/environment';
import { goto } from '$app/navigation';

import { createPageState } from './page-state';
import { resolveRouteState } from './route-state';

import type {
	BackBehavior,
	BeginPageSwitchOptions,
	PageState,
	RouteState,
	TransitionPhase
} from './types';

function createUnknownRouteState(): RouteState {
	return resolveRouteState({ pathname: '/__unknown__', status: 200 });
}

function createUnknownPageState(): PageState {
	return createPageState({
		routeState: createUnknownRouteState(),
		data: {}
	});
}

export class NavigationStateManager {
	routeState = $state<RouteState>(createUnknownRouteState());
	pageState = $state<PageState>(createUnknownPageState());
	pendingTarget = $state<string | null>(null);
	pendingPageState = $state<PageState | null>(null);
	phase = $state<TransitionPhase>('idle');
	enterDurationMs = $state(260);

	#enterTimer: ReturnType<typeof setTimeout> | null = null;

	sync(routeState: RouteState, pageState: PageState) {
		this.routeState = routeState;
		this.pageState = pageState;

		if (this.phase === 'navigating' && this.pendingTarget === routeState.pathname) {
			this.#startEntering();
		}
	}

	beginPageSwitch(
		targetPath: string,
		targetPageState: PageState,
		options: BeginPageSwitchOptions
	): boolean {
		void options.origin;

		if (this.phase !== 'idle') {
			return false;
		}

		this.#clearEnterTimer();
		this.pendingTarget = targetPath;
		this.pendingPageState = targetPageState;
		this.enterDurationMs = options.reducedMotion ? 140 : 260;
		this.phase = 'exiting';

		return true;
	}

	markNavigating() {
		if (this.phase === 'exiting') {
			this.phase = 'navigating';
		}
	}

	cancelPageSwitch() {
		this.#clearEnterTimer();
		this.phase = 'idle';
		this.pendingTarget = null;
		this.pendingPageState = null;
	}

	async goBack(back?: BackBehavior) {
		if (browser && window.history.length > 1) {
			window.history.back();
			return;
		}

		if (back?.fallbackHref) {
			await goto(back.fallbackHref);
		}
	}

	destroy() {
		this.#clearEnterTimer();
	}

	#startEntering() {
		this.#clearEnterTimer();
		this.phase = 'entering';
		this.#enterTimer = setTimeout(() => {
			this.finishEntering();
		}, this.enterDurationMs);
	}

	private finishEntering() {
		this.#clearEnterTimer();
		this.phase = 'idle';
		this.pendingTarget = null;
		this.pendingPageState = null;
	}

	#clearEnterTimer() {
		if (this.#enterTimer) {
			clearTimeout(this.#enterTimer);
			this.#enterTimer = null;
		}
	}
}

export function createNavigationStateManager(
	initialRouteState?: RouteState,
	initialPageState?: PageState
) {
	const manager = new NavigationStateManager();

	if (initialRouteState) {
		manager.routeState = initialRouteState;
	}

	if (initialPageState) {
		manager.pageState = initialPageState;
	}

	return manager;
}
