import { json, type RequestHandler } from '@sveltejs/kit'

import { ManageError } from '$lib/server/manage/errors'
import { parseGroupKind, listManagedGroups } from '$lib/server/manage/groups'
import { toManageErrorResponse } from '$lib/server/manage/http'

export const prerender = false

export const GET: RequestHandler = async ({ locals, params, platform }) => {
	try {
		if (!locals.manageAccess) throw new ManageError(401, 'access_unauthorized', 'Access denied')
		return json(await listManagedGroups(platform, parseGroupKind(params.kind ?? '')))
	} catch (error) {
		return toManageErrorResponse(error)
	}
}
