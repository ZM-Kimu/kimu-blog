import { browser } from '$app/environment'
import { invalidateAll } from '$app/navigation'
import { DEFAULT_LOCALE, LOCALE_COOKIE, type AppLocale } from '$lib/i18n/config'

import {
	persistBackgroundAnimationPreference,
	persistCursorMode,
	readStoredBackgroundAnimationPreference,
	readStoredCursorMode
} from './runtime-preferences'

import type { BackgroundAnimationPreference, BackgroundAnimationStatus } from './types'

export class NavigationPreferencesRuntime {
	locale = $state<AppLocale>(DEFAULT_LOCALE)
	topbarCollapsed = $state(false)
	settingsOpen = $state(false)
	cursorMode = $state<'custom' | 'system'>('custom')
	backgroundAnimationPreference = $state<BackgroundAnimationPreference>('on')
	backgroundAnimationStatus = $state<BackgroundAnimationStatus>('idle')

	syncLocale(locale?: AppLocale) {
		this.locale = locale ?? this.locale
	}

	hydrate() {
		if (!browser) {
			return
		}

		const savedCursorMode = readStoredCursorMode(window.localStorage)
		if (savedCursorMode) {
			this.cursorMode = savedCursorMode
		}

		const savedBackgroundAnimationPreference = readStoredBackgroundAnimationPreference(
			window.localStorage
		)
		if (savedBackgroundAnimationPreference) {
			this.backgroundAnimationPreference = savedBackgroundAnimationPreference
		}
	}

	toggleTopbarCollapsed(force?: boolean) {
		const nextValue = force ?? !this.topbarCollapsed
		this.topbarCollapsed = nextValue

		if (nextValue) {
			this.settingsOpen = false
		}
	}

	openTopbarSettings() {
		this.topbarCollapsed = false
		this.settingsOpen = true
	}

	closeTopbarSettings() {
		this.settingsOpen = false
	}

	setCursorMode(mode: 'custom' | 'system') {
		this.cursorMode = mode

		if (browser) {
			persistCursorMode(window.localStorage, mode)
		}
	}

	setBackgroundAnimationPreference(mode: BackgroundAnimationPreference) {
		this.backgroundAnimationPreference = mode
		this.backgroundAnimationStatus = 'idle'

		if (browser) {
			persistBackgroundAnimationPreference(window.localStorage, mode)
		}
	}

	setBackgroundAnimationStatus(status: BackgroundAnimationStatus) {
		this.backgroundAnimationStatus = status
	}

	toggleCursorMode() {
		this.setCursorMode(this.cursorMode === 'custom' ? 'system' : 'custom')
	}

	async toggleLocale() {
		if (!browser) {
			return
		}

		const nextLocale: AppLocale = this.locale === 'zh-CN' ? 'en-US' : 'zh-CN'
		this.settingsOpen = false
		document.cookie = `${LOCALE_COOKIE}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`
		this.locale = nextLocale
		await invalidateAll()
	}
}
