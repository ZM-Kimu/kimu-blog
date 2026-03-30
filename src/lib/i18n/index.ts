import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from './config'
import type { AppMessages } from './messages/schema'
import { enUSMessages } from './messages/en-US'
import { zhCNMessages } from './messages/zh-CN'

export type LocaleMessages = AppMessages
export type MessageParams = Record<string, string | number | boolean | null | undefined>

const dictionaries: Record<AppLocale, AppMessages> = {
	'zh-CN': zhCNMessages,
	'en-US': enUSMessages
}

export interface I18nPayload {
	locale: AppLocale
	locales: readonly AppLocale[]
	messages: AppMessages
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

export function getMessages(locale: AppLocale): AppMessages {
	return dictionaries[locale]
}

export function createI18nPayload(locale: AppLocale): I18nPayload {
	return {
		locale,
		locales: SUPPORTED_LOCALES,
		messages: getMessages(locale)
	}
}

function resolveLocaleFromMessages(messages: AppMessages) {
	for (const locale of SUPPORTED_LOCALES) {
		if (dictionaries[locale] === messages) {
			return locale
		}
	}

	return DEFAULT_LOCALE
}

function resolveMessage(messages: AppMessages, key: string) {
	const segments = key.split('.')
	let cursor: unknown = messages

	for (const segment of segments) {
		if (typeof cursor !== 'object' || cursor === null || !(segment in cursor)) {
			return null
		}

		cursor = (cursor as Record<string, unknown>)[segment]
	}

	return typeof cursor === 'string' ? cursor : null
}

function interpolate(message: string, params?: MessageParams) {
	if (!params) {
		return message
	}

	return message.replace(/\{(\w+)\}/g, (_, token: string) => {
		const value = params[token]
		return value === undefined || value === null ? '' : String(value)
	})
}

function createMissingTranslationError(locale: AppLocale, key: string) {
	return new Error(`Missing i18n message for locale "${locale}" and key "${key}"`)
}

export function translate(
	messages: AppMessages | undefined,
	key: string,
	params?: MessageParams
): string {
	const activeMessages = messages ?? dictionaries[DEFAULT_LOCALE]
	const activeLocale = resolveLocaleFromMessages(activeMessages)
	const translated = resolveMessage(activeMessages, key)

	if (translated !== null) {
		return interpolate(translated, params)
	}

	if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
		throw createMissingTranslationError(activeLocale, key)
	}

	const fallback = resolveMessage(dictionaries[DEFAULT_LOCALE], key)
	if (fallback !== null) {
		return interpolate(fallback, params)
	}

	throw createMissingTranslationError(DEFAULT_LOCALE, key)
}

export const formatMessage = translate
