import { missionCatalog } from '$lib/features/blog/config'
import type { ArchiveCategoryGroup, ArchiveYearGroup } from '$lib/types/content'

import { getAllPosts } from './posts'

export function getArchiveByCategory(): ArchiveCategoryGroup[] {
	return missionCatalog
		.filter((mission) => mission.href.startsWith('/blog/archive#'))
		.map((mission) => {
			const posts = getAllPosts().filter(
				(post) =>
					(post.categorySlug && mission.matches.includes(post.categorySlug)) ||
					(post.category && mission.matches.includes(post.category))
			)

			return {
				category: {
					name: mission.title,
					slug: mission.slug,
					count: posts.length
				},
				posts
			}
		})
}

export function getArchiveByYear(): ArchiveYearGroup[] {
	return Object.entries(Object.groupBy(getAllPosts(), (post) => post.date.slice(0, 4)))
		.filter((entry): entry is [string, NonNullable<(typeof entry)[1]>] => Boolean(entry[1]))
		.map(([year, posts]) => ({ year, posts }))
}
