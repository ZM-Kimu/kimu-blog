import { browser } from '$app/environment'
import { bindMediaQuery } from '$lib/features/home/home-page.media'

export const portraitQuery = '(orientation: portrait)'
export const coarsePointerQuery = '(pointer: coarse)'
export const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

export class SiteMediaRuntime {
	publicLayoutMode = $state<'landscape' | 'portrait'>('landscape')
	isCoarsePointer = $state(false)
	prefersReducedMotion = $state(false)

	mount() {
		if (!browser) {
			return () => undefined
		}

		const unbindPortrait = bindMediaQuery(portraitQuery, (matches) => {
			this.publicLayoutMode = matches ? 'portrait' : 'landscape'
		})
		const unbindCoarsePointer = bindMediaQuery(coarsePointerQuery, (matches) => {
			this.isCoarsePointer = matches
		})
		const unbindReducedMotion = bindMediaQuery(reducedMotionQuery, (matches) => {
			this.prefersReducedMotion = matches
		})

		return () => {
			unbindPortrait()
			unbindCoarsePointer()
			unbindReducedMotion()
		}
	}
}
