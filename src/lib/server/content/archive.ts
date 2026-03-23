import { getAllPosts } from './posts';

export function getArchiveIndex() {
	return Object.values(Object.groupBy(getAllPosts(), (post) => post.date.slice(0, 4))).filter(
		Boolean
	);
}
