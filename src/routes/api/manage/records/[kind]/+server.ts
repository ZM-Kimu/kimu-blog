import { json, type RequestHandler } from '@sveltejs/kit'

import { ManageError } from '$lib/server/manage/errors'
import {
	parseManageRecordKind,
	parseManageRecordWritePayload,
	toManageErrorResponse
} from '$lib/server/manage/http'
import { createManagedRecord, listManagedRecords } from '$lib/server/manage/service'

export const prerender = false

export const GET: RequestHandler = async ({ locals, params, platform }) => {
	try {
		if (!locals.manageAccess) {
			throw new ManageError(401, 'access_unauthorized', 'Cloudflare Access verification failed')
		}

		const kind = parseManageRecordKind(params.kind ?? '')
		return json(await listManagedRecords(platform, kind))
	} catch (error) {
		return toManageErrorResponse(error)
	}
}

export const POST: RequestHandler = async ({ locals, params, platform, request }) => {
	try {
		if (!locals.manageAccess) {
			throw new ManageError(401, 'access_unauthorized', 'Cloudflare Access verification failed')
		}

		const kind = parseManageRecordKind(params.kind ?? '')
		const payload = await parseManageRecordWritePayload(request, kind, 'create')
		return json(await createManagedRecord(platform, locals.manageAccess, kind, payload))
	} catch (error) {
		return toManageErrorResponse(error)
	}
}
