import { json, type RequestHandler } from '@sveltejs/kit';

import { ManageError } from '$lib/server/manage/errors';
import { toManageErrorResponse } from '$lib/server/manage/http';
import { getManageHealth } from '$lib/server/manage/service';

export const prerender = false;

export const GET: RequestHandler = async ({ locals, platform }) => {
	try {
		if (!locals.manageAccess) {
			throw new ManageError(401, 'access_unauthorized', 'Cloudflare Access 校验未通过');
		}

		return json(await getManageHealth(platform, locals.manageAccess));
	} catch (error) {
		return toManageErrorResponse(error);
	}
};
