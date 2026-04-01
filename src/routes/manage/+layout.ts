import { error } from '@sveltejs/kit'
import type { LayoutLoad } from './$types'

import { fetchManageSession, ManageApiError } from '$lib/features/manage/api'
import { resolveManageErrorMessage } from '$lib/features/manage/copy'

export const ssr = false
export const prerender = false

export const load: LayoutLoad = async ({ fetch, parent }) => {
	const { i18n } = await parent()

	try {
		return {
			session: await fetchManageSession(fetch)
		}
	} catch (cause) {
		if (cause instanceof ManageApiError) {
			throw error(
				cause.status,
				resolveManageErrorMessage(i18n?.messages, cause.code, cause.rawMessage)
			)
		}

		throw error(500, resolveManageErrorMessage(i18n?.messages, 'session_init_failed'))
	}
}
