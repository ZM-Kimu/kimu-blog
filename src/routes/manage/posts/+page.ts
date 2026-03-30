import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

import { fetchManagedPostList, ManageApiError } from '$lib/features/manage/api'
import { resolveManageErrorMessage } from '$lib/features/manage/copy'

export const load: PageLoad = async ({ fetch, parent }) => {
	const { i18n } = await parent()

	try {
		const { items } = await fetchManagedPostList(fetch)

		return { items }
	} catch (cause) {
		if (cause instanceof ManageApiError) {
			throw error(
				cause.status,
				resolveManageErrorMessage(i18n?.messages, cause.code, cause.rawMessage)
			)
		}

		throw error(500, resolveManageErrorMessage(i18n?.messages, 'post_list_load_failed'))
	}
}
