import { createI18nPayload, resolveRequestLocale } from '$lib/i18n';
import { LOCALE_COOKIE } from '$lib/i18n/config';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ cookies, request }) => {
	const locale = resolveRequestLocale(
		cookies.get(LOCALE_COOKIE),
		request.headers.get('accept-language')
	);

	return {
		i18n: createI18nPayload(locale)
	};
};
