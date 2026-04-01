import { missionCatalog } from '$lib/features/blog/config'
import type { HomePageData, HomePageMissionPreviewItem } from './home-page.types'

export type HomePageViewModel = {
	missionPreview: HomePageMissionPreviewItem[]
}

export function createHomePageViewModel(data: HomePageData): HomePageViewModel {
	return {
		missionPreview: missionCatalog.slice(0, 3).map((mission) => ({
			slug: mission.slug,
			id: mission.id,
			href: mission.href,
			tone: mission.tone,
			count:
				data.categories
					.filter(
						(category) =>
							mission.matches.includes(category.slug) || mission.matches.includes(category.name)
					)
					.reduce((total, category) => total + category.count, 0) ?? 0
		}))
	}
}
