import { DEFAULT_LOCALE } from '$lib/i18n/config';

const formatOptions: Intl.DateTimeFormatOptions = {
	year: 'numeric',
	month: 'long',
	day: 'numeric'
};

export function formatDate(value: string, locale = DEFAULT_LOCALE) {
	return new Intl.DateTimeFormat(locale, formatOptions).format(new Date(value));
}
