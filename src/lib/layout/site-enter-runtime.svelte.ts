import { browser } from '$app/environment'

import type { MotionTokens } from '$lib/motion/tokens'

export class SiteEnterRuntime {
	desktopHomeEnterActive = $state(false)
	desktopSubpageEnterActive = $state(false)
	queuedDesktopEnterVariant = $state<'none' | 'subpage'>('none')

	#desktopHomeEnterTimer: ReturnType<typeof setTimeout> | null = null
	#desktopSubpageEnterTimer: ReturnType<typeof setTimeout> | null = null

	prepareNavigation(queueDesktopSubpageEnter: boolean) {
		this.clearDesktopHomeEnterTimer()
		this.clearDesktopSubpageEnterTimer()
		this.desktopHomeEnterActive = false
		this.desktopSubpageEnterActive = false
		this.queuedDesktopEnterVariant = queueDesktopSubpageEnter ? 'subpage' : 'none'
	}

	syncDesktopHomeEnter(args: {
		pageMotionFamily: string
		isLandscapePublicLayout: boolean
		isRouteEntering: boolean
		motionTokens: MotionTokens
	}) {
		if (!browser) {
			return
		}

		if (args.pageMotionFamily !== 'main' || !args.isLandscapePublicLayout) {
			this.clearDesktopHomeEnterTimer()
			this.desktopHomeEnterActive = false
			return
		}

		if (!args.isRouteEntering) {
			return
		}

		this.clearDesktopHomeEnterTimer()
		this.desktopHomeEnterActive = true
		this.#desktopHomeEnterTimer = setTimeout(() => {
			this.#desktopHomeEnterTimer = null
			this.desktopHomeEnterActive = false
		}, args.motionTokens.route.desktopHomeEnterDurationMs)
	}

	syncDesktopSubpageEnter(args: {
		isPublicScreenRoute: boolean
		pageMotionFamily: string
		isLandscapePublicLayout: boolean
		isRouteEntering: boolean
		motionTokens: MotionTokens
	}) {
		if (!browser) {
			return
		}

		if (
			!args.isPublicScreenRoute ||
			args.pageMotionFamily !== 'subpage' ||
			!args.isLandscapePublicLayout
		) {
			this.clearDesktopSubpageEnterTimer()
			this.desktopSubpageEnterActive = false
			if (args.pageMotionFamily === 'main' || !args.isLandscapePublicLayout) {
				this.queuedDesktopEnterVariant = 'none'
			}
			return
		}

		if (!args.isRouteEntering || this.queuedDesktopEnterVariant !== 'subpage') {
			return
		}

		this.queuedDesktopEnterVariant = 'none'
		this.clearDesktopSubpageEnterTimer()
		this.desktopSubpageEnterActive = true
		this.#desktopSubpageEnterTimer = setTimeout(() => {
			this.#desktopSubpageEnterTimer = null
			this.desktopSubpageEnterActive = false
		}, args.motionTokens.route.desktopSubpageEnterDurationMs)
	}

	destroy() {
		this.clearDesktopHomeEnterTimer()
		this.clearDesktopSubpageEnterTimer()
	}

	private clearDesktopHomeEnterTimer() {
		if (this.#desktopHomeEnterTimer === null) {
			return
		}

		clearTimeout(this.#desktopHomeEnterTimer)
		this.#desktopHomeEnterTimer = null
	}

	private clearDesktopSubpageEnterTimer() {
		if (this.#desktopSubpageEnterTimer === null) {
			return
		}

		clearTimeout(this.#desktopSubpageEnterTimer)
		this.#desktopSubpageEnterTimer = null
	}
}
