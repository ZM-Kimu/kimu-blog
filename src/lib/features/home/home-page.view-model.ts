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
			count: mission.category
				? (data.categories.find((category) => category.slug === mission.category)?.count ?? 0)
				: 0
		}))
	}
}
