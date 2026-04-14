import { browser } from '$app/environment'
import { goto } from '$app/navigation'
import { resolve } from '$app/paths'

import { AppHistoryTracker } from './app-history'

import type { BackBehavior } from './types'

export class NavigationHistoryRuntime {
	#historyTracker = new AppHistoryTracker()

	hydrate(pathname: string) {
		if (!browser) {
			return
		}

		this.#historyTracker.seed(this.#readClientHistoryEntryId(), pathname)
	}

	sync(pathname: string, hydrated: boolean) {
		if (!browser || !hydrated) {
			return
		}

		this.#historyTracker.sync(this.#readClientHistoryEntryId(), pathname)
	}

	async goBack(currentPathname: string, back?: BackBehavior) {
		if (browser) {
			const historyDelta = this.#historyTracker.getPreviousPathDelta(currentPathname)
			if (historyDelta !== null) {
				window.history.go(historyDelta)
				return
			}
		}

		if (back?.fallbackHref) {
			await goto(resolve(back.fallbackHref))
		}
	}

	#readClientHistoryEntryId() {
		if (!browser) {
			return null
		}

		const entryId = window.history.state?.['sveltekit:history']
		return typeof entryId === 'string' || typeof entryId === 'number' ? String(entryId) : null
	}
}
