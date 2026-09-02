import { browser } from '$app/environment'
import { getMotionTokens, type MotionTokens } from '$lib/motion/tokens'

import { wait } from './navigation-flow'
import { portraitQuery, reducedMotionQuery } from './site-media-runtime.svelte'

import type { RouteState } from '$lib/navigation/types'

export type SiteBootPhase = 'boot' | 'entry' | 'idle'

export class SiteBootRuntime {
	siteBootPhase = $state<SiteBootPhase>('boot')

	#entryTimer: ReturnType<typeof setTimeout> | null = null
	#bootAssetsObserver: MutationObserver | null = null

	constructor(initialPathname: string) {
		this.siteBootPhase =
			initialPathname === '/manage' || initialPathname.startsWith('/manage/') ? 'idle' : 'boot'
	}

	getSiteFrameMotionStyle(tokens: MotionTokens) {
		const activeBootEntryDurationMs =
			this.siteBootPhase === 'idle' ? 0 : tokens.boot.entryDurationMs
		return `--motion-boot-active-entry-duration: ${activeBootEntryDurationMs}ms;`
	}

	mount(routeState: RouteState) {
		if (!browser) {
			return () => undefined
		}

		if (routeState.kind === 'manage') {
			this.siteBootPhase = 'idle'
			return () => {
				this.disconnectBootAssetsObserver()
				this.clearEntryTimer()
			}
		}

		const bootMotionTokens = getMotionTokens({
			portrait: window.matchMedia(portraitQuery).matches,
			reducedMotion: window.matchMedia(reducedMotionQuery).matches
		})
		const bootDurationMs = bootMotionTokens.boot.holdDurationMs
		const entryDurationMs = bootMotionTokens.boot.entryDurationMs
		let isDisposed = false

		void Promise.all([wait(bootDurationMs), this.waitForBootAssetsReady()]).then(() => {
			if (isDisposed) {
				return
			}

			this.siteBootPhase = 'entry'
			this.#entryTimer = setTimeout(() => {
				this.#entryTimer = null
				if (!isDisposed) {
					this.siteBootPhase = 'idle'
				}
			}, entryDurationMs)
		})

		return () => {
			isDisposed = true
			this.disconnectBootAssetsObserver()
			this.clearEntryTimer()
		}
	}

	destroy() {
		this.disconnectBootAssetsObserver()
		this.clearEntryTimer()
	}

	private clearEntryTimer() {
		if (this.#entryTimer === null) {
			return
		}

		clearTimeout(this.#entryTimer)
		this.#entryTimer = null
	}

	private disconnectBootAssetsObserver() {
		this.#bootAssetsObserver?.disconnect()
		this.#bootAssetsObserver = null
	}

	private waitForBootAssetsReady() {
		return new Promise<void>((resolvePromise) => {
			const root = document.documentElement
			if (root.dataset.siteBootAssets === 'ready') {
				resolvePromise()
				return
			}

			this.#bootAssetsObserver = new MutationObserver(() => {
				if (root.dataset.siteBootAssets !== 'ready') {
					return
				}

				this.disconnectBootAssetsObserver()
				resolvePromise()
			})

			this.#bootAssetsObserver.observe(root, {
				attributes: true,
				attributeFilter: ['data-site-boot-assets']
			})
		})
	}
}
