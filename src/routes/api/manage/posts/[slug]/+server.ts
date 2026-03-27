import { json, type RequestHandler } from '@sveltejs/kit'

import { ManageError } from '$lib/server/manage/errors'
import {
	parseDeletePayload,
	parseManageSlug,
	parseManageWriteFormData,
	toManageErrorResponse
} from '$lib/server/manage/http'
import { deleteManagedPost, getManagedPost, updateManagedPost } from '$lib/server/manage/service'

export const prerender = false

export const GET: RequestHandler = async ({ locals, params, platform }) => {
	try {
		if (!locals.manageAccess) {
			throw new ManageError(401, 'access_unauthorized', 'Cloudflare Access 校验未通过')
		}

		const slug = parseManageSlug(params.slug ?? '')

		return json(await getManagedPost(platform, slug))
	} catch (error) {
		return toManageErrorResponse(error)
	}
}

export const PUT: RequestHandler = async ({ locals, params, platform, request }) => {
	try {
		if (!locals.manageAccess) {
			throw new ManageError(401, 'access_unauthorized', 'Cloudflare Access 校验未通过')
		}

		const slug = parseManageSlug(params.slug ?? '')
		const { files, payload } = await parseManageWriteFormData(request, 'update')

		return json(await updateManagedPost(platform, locals.manageAccess, slug, payload, files))
	} catch (error) {
		return toManageErrorResponse(error)
	}
}

export const DELETE: RequestHandler = async ({ locals, params, platform, request }) => {
	try {
		if (!locals.manageAccess) {
			throw new ManageError(401, 'access_unauthorized', 'Cloudflare Access 校验未通过')
		}

		const slug = parseManageSlug(params.slug ?? '')
		const payload = await parseDeletePayload(request)

		return json(await deleteManagedPost(platform, locals.manageAccess, slug, payload.expectedSha))
	} catch (error) {
		return toManageErrorResponse(error)
	}
}
