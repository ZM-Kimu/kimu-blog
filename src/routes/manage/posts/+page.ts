import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

import { fetchManagedPostList, ManageApiError } from '$lib/features/manage/api';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const { items } = await fetchManagedPostList(fetch);

		return { items };
	} catch (cause) {
		if (cause instanceof ManageApiError) {
			throw error(cause.status, cause.message);
		}

		throw error(500, cause instanceof Error ? cause.message : '文章列表加载失败');
	}
};
