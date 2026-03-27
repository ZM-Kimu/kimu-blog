import type { Handle } from '@sveltejs/kit';

import { verifyManageAccessToken } from '$lib/server/manage/access';
import { getManageConfig } from '$lib/server/manage/config';
import { ManageError } from '$lib/server/manage/errors';
import { toManageErrorResponse } from '$lib/server/manage/http';

const MANAGE_PATH_PREFIX = '/api/manage/';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.manageAccess = null;

	if (!event.url.pathname.startsWith(MANAGE_PATH_PREFIX)) {
		return resolve(event);
	}

	try {
		const config = getManageConfig(event.platform);
		const token = event.request.headers.get('cf-access-jwt-assertion');

		if (!token) {
			throw new ManageError(401, 'access_unauthorized', '缺少 Cf-Access-Jwt-Assertion');
		}

		event.locals.manageAccess = await verifyManageAccessToken(
			token,
			config.cfAccessTeamDomain,
			config.cfAccessAud
		);
	} catch (error) {
		return toManageErrorResponse(error);
	}

	return resolve(event);
};
