import { missionCatalog } from '$lib/constants/command-center';
import type { HomeTopbarAction, HomeTopbarMetric } from './topbar/home-topbar.types';
import type { HomeMissionPreviewItem, HomeScreenData } from './home-screen.types';

export type HomeScreenViewModel = {
	topMetrics: HomeTopbarMetric[];
	topbarActions: readonly HomeTopbarAction[];
	missionPreview: HomeMissionPreviewItem[];
};

const topbarActions = [
	{ href: '/updates', label: 'Live' },
	{ href: '/favorites', label: 'Fav' },
	{ href: '/about', label: 'Info' }
] as const satisfies readonly HomeTopbarAction[];

export function createHomeScreenViewModel(data: HomeScreenData): HomeScreenViewModel {
	const totalCategories = data.categories.length;

	return {
		topMetrics: [
			{ key: 'logs', label: 'Logs', value: String(data.totalPosts).padStart(2, '0') },
			{ key: 'missions', label: 'Missions', value: String(totalCategories).padStart(2, '0') },
			{ key: 'mode', label: 'Mode', value: 'LIVE' }
		],
		topbarActions,
		missionPreview: missionCatalog.slice(0, 3).map((mission) => ({
			...mission,
			count:
				data.categories
					.filter(
						(category) =>
							mission.matches.includes(category.slug) || mission.matches.includes(category.name)
					)
					.reduce((total, category) => total + category.count, 0) ?? 0
		}))
	};
}
