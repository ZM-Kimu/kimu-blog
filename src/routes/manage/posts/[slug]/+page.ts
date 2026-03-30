import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

import { fetchManagedPost, ManageApiError } from '$lib/features/manage/api'
import { resolveManageErrorMessage } from '$lib/features/manage/copy'

export const load: PageLoad = async ({ fetch, params, parent }) => {
	const { i18n } = await parent()

	try {
		return {
			post: await fetchManagedPost(fetch, params.slug)
		}
	} catch (cause) {
		if (cause instanceof ManageApiError) {
			throw error(
				cause.status,
				resolveManageErrorMessage(i18n?.messages, cause.code, cause.rawMessage)
			)
		}

		throw error(500, resolveManageErrorMessage(i18n?.messages, 'post_load_failed'))
	}
}
