import { browser } from '$app/environment'
import { createI18nPayload, resolveRequestLocale } from '$lib/i18n'
import { DEFAULT_LOCALE, LOCALE_COOKIE } from '$lib/i18n/config'

import type { LayoutLoad } from './$types'

function readLocaleCookie(name: string) {
	if (!browser) {
		return null
	}

	const prefix = `${name}=`
	for (const segment of document.cookie.split(';')) {
		const entry = segment.trim()
		if (entry.startsWith(prefix)) {
			return decodeURIComponent(entry.slice(prefix.length))
		}
	}

	return null
}

export const load: LayoutLoad = async ({ data }) => {
	const locale = browser
		? resolveRequestLocale(
				readLocaleCookie(LOCALE_COOKIE),
				navigator.languages?.join(',') ?? navigator.language
			)
		: (data.i18n?.locale ?? DEFAULT_LOCALE)

	return {
		i18n: createI18nPayload(locale)
	}
}
