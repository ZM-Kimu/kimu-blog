import { browser } from '$app/environment'

import type { SiteBootPhase } from './site-boot-runtime.svelte'

import type { MotionTokens } from '$lib/motion/tokens'

export class SiteNoticeRuntime {
	portraitOrientationToastVisible = $state(false)
	portraitOrientationToastClosing = $state(false)
	portraitOrientationToastWasEligible = $state(false)

	#portraitOrientationToastTimer: ReturnType<typeof setTimeout> | null = null
	#portraitOrientationToastExitTimer: ReturnType<typeof setTimeout> | null = null

	syncPortraitOrientationToast(args: {
		isPortraitPublicLayout: boolean
		motionTokens: MotionTokens
		siteBootPhase: SiteBootPhase
	}) {
		if (!browser) {
			return
		}

		const toastEligible = args.isPortraitPublicLayout && args.siteBootPhase === 'idle'
		if (toastEligible && !this.portraitOrientationToastWasEligible) {
			this.showPortraitOrientationToast(args.motionTokens)
		} else if (!toastEligible) {
			this.hidePortraitOrientationToastImmediate()
		}

		this.portraitOrientationToastWasEligible = toastEligible
	}

	destroy() {
		this.clearPortraitOrientationToastTimers()
	}

	private clearPortraitOrientationToastTimers() {
		if (this.#portraitOrientationToastTimer !== null) {
			clearTimeout(this.#portraitOrientationToastTimer)
			this.#portraitOrientationToastTimer = null
		}

		if (this.#portraitOrientationToastExitTimer !== null) {
			clearTimeout(this.#portraitOrientationToastExitTimer)
			this.#portraitOrientationToastExitTimer = null
		}
	}

	private hidePortraitOrientationToastImmediate() {
		this.clearPortraitOrientationToastTimers()
		this.portraitOrientationToastClosing = false
		this.portraitOrientationToastVisible = false
	}

	private showPortraitOrientationToast(tokens: MotionTokens) {
		this.hidePortraitOrientationToastImmediate()
		this.portraitOrientationToastVisible = true
		this.portraitOrientationToastClosing = false

		this.#portraitOrientationToastTimer = setTimeout(() => {
			this.#portraitOrientationToastTimer = null
			this.portraitOrientationToastClosing = true

			this.#portraitOrientationToastExitTimer = setTimeout(() => {
				this.#portraitOrientationToastExitTimer = null
				this.portraitOrientationToastClosing = false
				this.portraitOrientationToastVisible = false
			}, tokens.notice.exitDurationMs)
		}, tokens.notice.visibleDurationMs)
	}
}
