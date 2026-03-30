import { getAllPosts } from './posts'

import type { TopbarMetricsData } from '$lib/navigation/types'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

function parseIsoDate(date: string) {
	return Date.parse(`${date}T00:00:00Z`)
}

export function getTopbarMetrics(referenceDate = new Date()): TopbarMetricsData {
	const posts = getAllPosts()
	const threshold = referenceDate.getTime() - THIRTY_DAYS_MS
	const recentPostActivityCount30d = posts.filter((post) => {
		const activityAt = Math.max(parseIsoDate(post.date), parseIsoDate(post.updated))
		return Number.isFinite(activityAt) && activityAt >= threshold
	}).length

	return {
		articleCount: posts.length,
		todoCount: null,
		recentPostActivityCount30d
	}
}
