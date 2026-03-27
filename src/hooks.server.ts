import type { Handle } from '@sveltejs/kit'

import { verifyManageAccessToken } from '$lib/server/manage/access'
import { getManageConfig } from '$lib/server/manage/config'
import { assertManageWriteRequestProtection } from '$lib/server/manage/csrf'
import { ManageError } from '$lib/server/manage/errors'
import { toManageErrorResponse } from '$lib/server/manage/http'

const MANAGE_PATH_PREFIX = '/api/manage/'
const MANAGE_APP_PREFIX = '/manage'

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.manageAccess = null

	const isManageApiRoute = event.url.pathname.startsWith(MANAGE_PATH_PREFIX)
	const isManageAppRoute =
		event.url.pathname === MANAGE_APP_PREFIX ||
		event.url.pathname.startsWith(`${MANAGE_APP_PREFIX}/`)

	if (!isManageApiRoute && !isManageAppRoute) {
		return resolve(event)
	}

	try {
		const config = getManageConfig(event.platform)
		const token = event.request.headers.get('cf-access-jwt-assertion')

		if (!token) {
			throw new ManageError(401, 'access_unauthorized', '缺少 Cf-Access-Jwt-Assertion')
		}

		event.locals.manageAccess = await verifyManageAccessToken(
			token,
			config.cfAccessTeamDomain,
			config.cfAccessAud
		)

		if (isManageApiRoute) {
			assertManageWriteRequestProtection(event)
		}
	} catch (error) {
		if (isManageApiRoute) {
			return toManageErrorResponse(error)
		}

		const status = error instanceof ManageError ? error.status : 500
		const message =
			error instanceof ManageError
				? error.message
				: error instanceof Error
					? error.message
					: 'Manage access 校验失败'

		return new Response(message, { status })
	}

	return resolve(event)
}
