export type RouteKind =
	| 'home'
	| 'blog'
	| 'archive'
	| 'post'
	| 'tag'
	| 'about'
	| 'updates'
	| 'favorites'
	| 'error'
	| 'unknown';

export type RouteState = {
	kind: RouteKind;
	pathname: string;
	status: number;
	isError: boolean;
	slug?: string;
	tag?: string;
};

export type TopbarMetric = {
	key: string;
	value: string;
	ariaLabel: string;
	icon: {
		src: string;
		mode: 'mask' | 'image';
		tint?: string;
	};
};

export type TopbarAction = {
	key: string;
	ariaLabel: string;
	icon: {
		src: string;
		mode: 'mask' | 'image';
		tint?: string;
	};
	interactive?: boolean;
};

export type BackBehavior = {
	kind: 'history';
	fallbackHref: string;
};

export type TopbarState = {
	variant: 'main' | 'subpage';
	title: string;
	metrics: readonly TopbarMetric[];
	actions: readonly TopbarAction[];
	back?: BackBehavior;
	motionPolicy?: 'rich' | 'reduced';
};

export type PageState = {
	route: RouteState;
	title: string;
	transitionKey: string;
	shellMode: 'screen' | 'shell';
	showGlobalChrome: boolean;
	topbar: TopbarState;
};

export type TransitionPhase = 'idle' | 'exiting' | 'navigating' | 'entering';

export type BeginPageSwitchOptions = {
	origin: string;
	reducedMotion?: boolean;
};
