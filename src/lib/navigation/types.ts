export type InternalHref =
	| '/'
	| '/about'
	| '/blog'
	| '/blog/archive'
	| '/favorites'
	| '/manage'
	| '/updates'
	| '/__debug/manage'
	| '/__debug/error-404'
	| '/__debug/error-500'
	| `/blog/${string}`

export type RouteKind =
	| 'home'
	| 'blog'
	| 'archive'
	| 'post'
	| 'tag'
	| 'about'
	| 'updates'
	| 'favorites'
	| 'manage'
	| 'debugManage'
	| 'error'
	| 'unknown'

export type RouteState = {
	kind: RouteKind
	pathname: string
	status: number
	isError: boolean
	slug?: string
	tag?: string
}

export type TopbarMetric = {
	key: string
	value: string
	label: string
	ariaLabel: string
	icon: {
		src: string
		mode: 'mask' | 'image'
		tint?: string
	}
}

export type TopbarAction = {
	key: string
	ariaLabel: string
	kind: 'command' | 'link'
	icon: {
		src: string
		mode: 'mask' | 'image'
		tint?: string
	}
	href?: InternalHref
	disabled?: boolean
}

export type TopbarMetricsData = {
	articleCount: number
	todoCount: number | null
	recentPostActivityCount30d: number
}

export type BackgroundAnimationPreference = 'on' | 'off'

export type BackgroundAnimationStatus = 'idle' | 'loading' | 'ready' | 'failed'

export type BackBehavior = {
	kind: 'history'
	fallbackHref: InternalHref
}

export type TopbarState = {
	variant: 'main' | 'subpage'
	title: string
	metrics: readonly TopbarMetric[]
	actions: readonly TopbarAction[]
	back?: BackBehavior
	motionPolicy?: 'rich' | 'reduced'
}

export type BackgroundPolicy = 'inherit' | 'replace'

export type BackgroundScene = 'neutral-default' | 'home-spine' | 'subpage-room'

export type TopbarShellVariant = 'main' | 'subpage' | 'none'

export type PageState = {
	route: RouteState
	title: string
	transitionKey: string
	motionFamily: 'main' | 'subpage'
	shellMode: 'screen' | 'shell'
	showGlobalChrome: boolean
	backgroundPolicy: BackgroundPolicy
	backgroundScene?: BackgroundScene
	topbarShellVariant: TopbarShellVariant
	topbar: TopbarState
}

export type TransitionPhase = 'idle' | 'exit' | 'entry'

export type BeginPageSwitchOptions = {
	origin: string
	portrait?: boolean
	reducedMotion?: boolean
}
