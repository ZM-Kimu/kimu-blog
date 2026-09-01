import { json, type RequestHandler } from '@sveltejs/kit'

import { ManageError } from '$lib/server/manage/errors'
import {
	parseDeletePayload,
	parseManageRecordId,
	parseManageRecordKind,
	parseManageRecordWritePayload,
	toManageErrorResponse
} from '$lib/server/manage/http'
import {
	deleteManagedRecord,
	getManagedRecord,
	updateManagedRecord
} from '$lib/server/manage/service'

export const prerender = false

export const GET: RequestHandler = async ({ locals, params, platform }) => {
	try {
		if (!locals.manageAccess) {
			throw new ManageError(401, 'access_unauthorized', 'Cloudflare Access verification failed')
		}

		const kind = parseManageRecordKind(params.kind ?? '')
		const id = parseManageRecordId(params.id ?? '')
		return json(await getManagedRecord(platform, kind, id))
	} catch (error) {
		return toManageErrorResponse(error)
	}
}

export const PUT: RequestHandler = async ({ locals, params, platform, request }) => {
	try {
		if (!locals.manageAccess) {
			throw new ManageError(401, 'access_unauthorized', 'Cloudflare Access verification failed')
		}

		const kind = parseManageRecordKind(params.kind ?? '')
		const id = parseManageRecordId(params.id ?? '')
		const payload = await parseManageRecordWritePayload(request, kind, 'update')
		return json(await updateManagedRecord(platform, locals.manageAccess, kind, id, payload))
	} catch (error) {
		return toManageErrorResponse(error)
	}
}

export const DELETE: RequestHandler = async ({ locals, params, platform, request }) => {
	try {
		if (!locals.manageAccess) {
			throw new ManageError(401, 'access_unauthorized', 'Cloudflare Access verification failed')
		}

		const kind = parseManageRecordKind(params.kind ?? '')
		const id = parseManageRecordId(params.id ?? '')
		const payload = await parseDeletePayload(request)
		return json(
			await deleteManagedRecord(platform, locals.manageAccess, kind, id, payload.expectedSha)
		)
	} catch (error) {
		return toManageErrorResponse(error)
	}
}
