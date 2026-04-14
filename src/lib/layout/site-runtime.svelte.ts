import type { NavigationStateManager } from '$lib/navigation/navigation-state.svelte'
import type { RouteState } from '$lib/navigation/types'
import type { MotionTokens } from '$lib/motion/tokens'

import { preventDocumentDragStart } from './site-document-runtime'
import { SiteBootRuntime, type SiteBootPhase } from './site-boot-runtime.svelte'
import { SiteEnterRuntime } from './site-enter-runtime.svelte'
import { SiteMediaRuntime } from './site-media-runtime.svelte'
import { SiteNoticeRuntime } from './site-notice-runtime.svelte'

export class SiteLayoutRuntime {
	#boot: SiteBootRuntime
	#media = new SiteMediaRuntime()
	#enter = new SiteEnterRuntime()
	#notice = new SiteNoticeRuntime()

	constructor(initialPathname: string) {
		this.#boot = new SiteBootRuntime(initialPathname)
	}

	get publicLayoutMode() {
		return this.#media.publicLayoutMode
	}

	get isCoarsePointer() {
		return this.#media.isCoarsePointer
	}

	get prefersReducedMotion() {
		return this.#media.prefersReducedMotion
	}

	get desktopHomeEnterActive() {
		return this.#enter.desktopHomeEnterActive
	}

	get desktopSubpageEnterActive() {
		return this.#enter.desktopSubpageEnterActive
	}

	get portraitOrientationToastVisible() {
		return this.#notice.portraitOrientationToastVisible
	}

	get portraitOrientationToastClosing() {
		return this.#notice.portraitOrientationToastClosing
	}

	get siteBootPhase() {
		return this.#boot.siteBootPhase
	}

	getSiteFrameMotionStyle(tokens: MotionTokens) {
		return this.#boot.getSiteFrameMotionStyle(tokens)
	}

	prepareNavigation(queueDesktopSubpageEnter: boolean) {
		this.#enter.prepareNavigation(queueDesktopSubpageEnter)
	}

	syncDesktopHomeEnter(args: {
		pageMotionFamily: string
		isLandscapePublicLayout: boolean
		isRouteEntering: boolean
		motionTokens: MotionTokens
	}) {
		this.#enter.syncDesktopHomeEnter(args)
	}

	syncDesktopSubpageEnter(args: {
		isPublicScreenRoute: boolean
		pageMotionFamily: string
		isLandscapePublicLayout: boolean
		isRouteEntering: boolean
		motionTokens: MotionTokens
	}) {
		this.#enter.syncDesktopSubpageEnter(args)
	}

	syncPortraitOrientationToast(args: {
		isPortraitPublicLayout: boolean
		motionTokens: MotionTokens
	}) {
		this.#notice.syncPortraitOrientationToast({
			...args,
			siteBootPhase: this.siteBootPhase
		})
	}

	mount(args: { routeState: RouteState; navigationManager: NavigationStateManager }) {
		args.navigationManager.hydrateClientRuntime()
		document.addEventListener('dragstart', preventDocumentDragStart)
		const unbindMediaRuntime = this.#media.mount()
		const disposeBootRuntime = this.#boot.mount(args.routeState)

		return () => {
			this.destroy()
			document.removeEventListener('dragstart', preventDocumentDragStart)
			unbindMediaRuntime()
			disposeBootRuntime()
		}
	}

	destroy() {
		this.#boot.destroy()
		this.#enter.destroy()
		this.#notice.destroy()
	}
}

export function createSiteLayoutRuntime(initialPathname: string) {
	return new SiteLayoutRuntime(initialPathname)
}

export type { SiteBootPhase }
