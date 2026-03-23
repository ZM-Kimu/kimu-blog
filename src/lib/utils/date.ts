const formatOptions: Intl.DateTimeFormatOptions = {
	year: 'numeric',
	month: 'long',
	day: 'numeric'
};

export function formatDate(value: string, locale = 'zh-CN') {
	return new Intl.DateTimeFormat(locale, formatOptions).format(new Date(value));
}
