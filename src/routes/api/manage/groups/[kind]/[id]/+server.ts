import { json, type RequestHandler } from '@sveltejs/kit'
import { z } from 'zod'

import { ManageError } from '$lib/server/manage/errors'
import { parseGroupId, parseGroupKind, renameManagedGroup } from '$lib/server/manage/groups'
import { toManageErrorResponse } from '$lib/server/manage/http'

export const prerender = false

const payloadSchema = z.object({
	expectedSha: z.string().min(1),
	name: z.string().trim().min(1).max(96)
})

export const PUT: RequestHandler = async ({ locals, params, platform, request }) => {
	try {
		if (!locals.manageAccess) throw new ManageError(401, 'access_unauthorized', 'Access denied')
		const payload = payloadSchema.safeParse(await request.json().catch(() => null))
		if (!payload.success) throw new ManageError(422, 'invalid_payload', 'Invalid rename payload')
		return json(
			await renameManagedGroup(
				platform,
				locals.manageAccess,
				parseGroupKind(params.kind ?? ''),
				parseGroupId(params.id ?? ''),
				payload.data
			)
		)
	} catch (error) {
		return toManageErrorResponse(error)
	}
}
