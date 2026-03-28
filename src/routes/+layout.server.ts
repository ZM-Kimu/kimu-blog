import { createI18nPayload, resolveRequestLocale } from '$lib/i18n'
import { LOCALE_COOKIE } from '$lib/i18n/config'
import { getTopbarMetrics } from '$lib/server/content/topbar'

import type { LayoutServerLoad } from './$types'

// Public routes may use server load only for build-safe local content assembly.
// Do not add GitHub or other third-party runtime fetches here; runtime function
// integrations are reserved for /manage.
export const load: LayoutServerLoad = async ({ cookies, request }) => {
	const locale = resolveRequestLocale(
		cookies.get(LOCALE_COOKIE),
		request.headers.get('accept-language')
	)
	const topbarMetrics = getTopbarMetrics()

	return {
		i18n: createI18nPayload(locale),
		topbarMetrics
	}
}
