import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

import { fetchManageSession, ManageApiError } from '$lib/features/manage/api';

export const ssr = false;
export const prerender = false;

export const load: LayoutLoad = async ({ fetch }) => {
	try {
		return {
			session: await fetchManageSession(fetch)
		};
	} catch (cause) {
		if (cause instanceof ManageApiError) {
			throw error(cause.status, cause.message);
		}

		throw error(500, cause instanceof Error ? cause.message : '管理会话初始化失败');
	}
};
