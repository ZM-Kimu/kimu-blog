export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'] as const

export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: AppLocale = 'zh-CN'
export const LOCALE_COOKIE = 'locale'

export const LOCALE_LABELS: Record<AppLocale, string> = {
	'zh-CN': '简体中文',
	'en-US': 'English'
}
