import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from './config'
import { enUSMessages } from './messages/en-US'
import { zhCNMessages } from './messages/zh-CN'

export interface LocaleMessages {
	[key: string]: string | LocaleMessages
}

const dictionaries: Record<AppLocale, LocaleMessages> = {
	'zh-CN': zhCNMessages,
	'en-US': enUSMessages
}

export interface I18nPayload {
	locale: AppLocale
	locales: readonly AppLocale[]
	messages: LocaleMessages
}

function normalizeLocale(candidate: string | null | undefined): AppLocale | null {
	if (!candidate) {
		return null
	}

	const trimmed = candidate.trim()

	if (!trimmed) {
		return null
	}

	if (SUPPORTED_LOCALES.includes(trimmed as AppLocale)) {
		return trimmed as AppLocale
	}

	const lower = trimmed.toLowerCase()

	if (lower.startsWith('zh')) {
		return 'zh-CN'
	}

	if (lower.startsWith('en')) {
		return 'en-US'
	}

	return null
}

function getAcceptLanguageCandidates(header: string | null | undefined) {
	if (!header) {
		return []
	}

	return header
		.split(',')
		.map((entry) => entry.split(';')[0]?.trim() ?? '')
		.filter(Boolean)
}

export function resolveRequestLocale(
	cookieLocale?: string | null,
	acceptLanguage?: string | null
): AppLocale {
	const candidates = [cookieLocale, ...getAcceptLanguageCandidates(acceptLanguage)]

	for (const candidate of candidates) {
		const locale = normalizeLocale(candidate)

		if (locale) {
			return locale
		}
	}

	return DEFAULT_LOCALE
}

export function getMessages(locale: AppLocale): LocaleMessages {
	return dictionaries[locale]
}

export function createI18nPayload(locale: AppLocale): I18nPayload {
	return {
		locale,
		locales: SUPPORTED_LOCALES,
		messages: getMessages(locale)
	}
}

export function translate(messages: LocaleMessages, key: string): string {
	const segments = key.split('.')
	let cursor: unknown = messages

	for (const segment of segments) {
		if (typeof cursor !== 'object' || cursor === null || !(segment in cursor)) {
			return key
		}

		cursor = (cursor as Record<string, unknown>)[segment]
	}

	return typeof cursor === 'string' ? cursor : key
}
