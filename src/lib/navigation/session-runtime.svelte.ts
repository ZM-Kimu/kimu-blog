import { browser } from '$app/environment'
import type { AppLocale } from '$lib/i18n/config'

import { NavigationHistoryRuntime } from './history-runtime'
import { NavigationPreferencesRuntime } from './preferences-runtime.svelte'

import type {
	BackBehavior,
	BackgroundAnimationPreference,
	BackgroundAnimationStatus
} from './types'

export class NavigationSessionRuntime {
	#preferences = new NavigationPreferencesRuntime()
	#history = new NavigationHistoryRuntime()

	#clientRuntimeHydrated = false

	get locale() {
		return this.#preferences.locale
	}

	get topbarCollapsed() {
		return this.#preferences.topbarCollapsed
	}

	get settingsOpen() {
		return this.#preferences.settingsOpen
	}

	get cursorMode() {
		return this.#preferences.cursorMode
	}

	get backgroundAnimationPreference() {
		return this.#preferences.backgroundAnimationPreference
	}

	get backgroundAnimationStatus() {
		return this.#preferences.backgroundAnimationStatus
	}

	sync(pathname: string, locale?: AppLocale) {
		this.#preferences.syncLocale(locale)
		this.#history.sync(pathname, this.#clientRuntimeHydrated)
	}

	hydrateClientRuntime(pathname: string) {
		if (!browser || this.#clientRuntimeHydrated) {
			return
		}

		this.#clientRuntimeHydrated = true
		this.#history.hydrate(pathname)
		this.#preferences.hydrate()
	}

	toggleTopbarCollapsed(force?: boolean) {
		this.#preferences.toggleTopbarCollapsed(force)
	}

	openTopbarSettings() {
		this.#preferences.openTopbarSettings()
	}

	closeTopbarSettings() {
		this.#preferences.closeTopbarSettings()
	}

	setCursorMode(mode: 'custom' | 'system') {
		this.#preferences.setCursorMode(mode)
	}

	setBackgroundAnimationPreference(mode: BackgroundAnimationPreference) {
		this.#preferences.setBackgroundAnimationPreference(mode)
	}

	setBackgroundAnimationStatus(status: BackgroundAnimationStatus) {
		this.#preferences.setBackgroundAnimationStatus(status)
	}

	toggleCursorMode() {
		this.#preferences.toggleCursorMode()
	}

	async toggleLocale() {
		await this.#preferences.toggleLocale()
	}

	async goBack(currentPathname: string, back?: BackBehavior) {
		await this.#history.goBack(currentPathname, back)
	}
}
