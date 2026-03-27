import { json, type RequestHandler } from '@sveltejs/kit';

import { ManageError } from '$lib/server/manage/errors';
import { parseManageWriteFormData, toManageErrorResponse } from '$lib/server/manage/http';
import { createManagedPost } from '$lib/server/manage/service';

export const prerender = false;

export const POST: RequestHandler = async ({ locals, platform, request }) => {
	try {
		if (!locals.manageAccess) {
			throw new ManageError(401, 'access_unauthorized', 'Cloudflare Access 校验未通过');
		}

		const { files, payload } = await parseManageWriteFormData(request, 'create');

		return json(await createManagedPost(platform, locals.manageAccess, payload, files));
	} catch (error) {
		return toManageErrorResponse(error);
	}
};
