import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

import { fetchManagedPost, ManageApiError } from '$lib/features/manage/api';

export const load: PageLoad = async ({ fetch, params }) => {
	try {
		return {
			post: await fetchManagedPost(fetch, params.slug)
		};
	} catch (cause) {
		if (cause instanceof ManageApiError) {
			throw error(cause.status, cause.message);
		}

		throw error(500, cause instanceof Error ? cause.message : '文章内容加载失败');
	}
};
