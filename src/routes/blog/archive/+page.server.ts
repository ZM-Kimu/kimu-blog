import { getArchiveByCategory, getArchiveByYear } from '$lib/server/content/archive';
import { getAllPosts } from '$lib/server/content/posts';

export const prerender = true;

export function load() {
	return {
		categoryGroups: getArchiveByCategory(),
		yearGroups: getArchiveByYear(),
		totalPosts: getAllPosts().length
	};
}
