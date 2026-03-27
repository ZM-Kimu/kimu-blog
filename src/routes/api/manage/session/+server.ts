import { json, type RequestHandler } from '@sveltejs/kit'

import { getOrCreateManageCsrfToken } from '$lib/server/manage/csrf'
import { ManageError } from '$lib/server/manage/errors'
import { toManageErrorResponse } from '$lib/server/manage/http'
import { getManageSession } from '$lib/server/manage/service'

export const prerender = false

export const GET: RequestHandler = async ({ cookies, locals, platform, url }) => {
	try {
		if (!locals.manageAccess) {
			throw new ManageError(401, 'access_unauthorized', 'Cloudflare Access 校验未通过')
		}

		const csrfToken = getOrCreateManageCsrfToken(cookies, url)

		return json(getManageSession(platform, locals.manageAccess, csrfToken))
	} catch (error) {
		return toManageErrorResponse(error)
	}
}
