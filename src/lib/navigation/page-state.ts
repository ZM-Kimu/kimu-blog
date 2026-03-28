import { siteConfig } from '$lib/config/site'
import { translate, type LocaleMessages } from '$lib/i18n'

import type { PageState, RouteState, TopbarAction, TopbarMetric, TopbarMetricsData } from './types'

function t(messages: LocaleMessages | undefined, key: string, fallback: string): string {
	if (!messages) {
		return fallback
	}

	const translated = translate(messages, key)
	return translated === key ? fallback : translated
}

const placeholderCount = '-'

const topbarMetricIcons = {
	articles: {
		src: '/icons/topbar/article.png',
		mode: 'mask' as const,
		tint: '#4277be'
	},
	todos: {
		src: '/icons/topbar/question_mark_green.png',
		mode: 'image' as const
	},
	recentActivity: {
		src: '/icons/topbar/tick_mark_yellow.png',
		mode: 'image' as const
	}
}

const topbarToolIcons = {
	language: {
		src: '/icons/topbar/localization.png',
		mode: 'mask' as const,
		tint: '#47639c'
	},
	collapse: {
		src: '/icons/topbar/collapse.png',
		mode: 'mask' as const,
		tint: '#47639c'
	},
	settings: {
		src: '/icons/topbar/settings.png',
		mode: 'mask' as const,
		tint: '#47639c'
	},
	home: {
		src: '/icons/topbar/home.png',
		mode: 'mask' as const,
		tint: '#47639c'
	}
}

function formatMetricValue(value: number | null | undefined) {
	if (value === null || value === undefined || Number.isNaN(value)) {
		return placeholderCount
	}

	return String(value)
}

function resolveTopbarMetricsData(data: Record<string, unknown>) {
	const metrics = data.topbarMetrics

	if (!metrics || typeof metrics !== 'object') {
		return null
	}

	return metrics as TopbarMetricsData
}

function createSharedMetrics(
	data: Record<string, unknown>,
	messages?: LocaleMessages
): readonly TopbarMetric[] {
	const metricsData = resolveTopbarMetricsData(data)
	const articleValue = formatMetricValue(metricsData?.articleCount)
	const todoValue = formatMetricValue(metricsData?.todoCount)
	const recentActivityValue = formatMetricValue(metricsData?.recentPostActivityCount30d)

	return [
		{
			key: 'articles',
			value: articleValue,
			label: t(messages, 'topbar.metrics.articles', '站点文章数'),
			ariaLabel: `${t(messages, 'topbar.metrics.articles', '站点文章数')} ${articleValue}`,
			icon: topbarMetricIcons.articles
		},
		{
			key: 'todos',
			value: todoValue,
			label: t(messages, 'topbar.metrics.todos', '待办事项数'),
			ariaLabel: `${t(messages, 'topbar.metrics.todos', '待办事项数')} ${todoValue}`,
			icon: topbarMetricIcons.todos
		},
		{
			key: 'recent-activity',
			value: recentActivityValue,
			label: t(messages, 'topbar.metrics.recentActivity', '最近 30 天更新/新增文章数'),
			ariaLabel: `${t(messages, 'topbar.metrics.recentActivity', '最近 30 天更新/新增文章数')} ${recentActivityValue}`,
			icon: topbarMetricIcons.recentActivity
		}
	]
}

function createHomeActions(messages?: LocaleMessages): readonly TopbarAction[] {
	return [
		{
			key: 'language',
			ariaLabel: t(messages, 'topbar.actions.language', '语言切换'),
			kind: 'command',
			icon: topbarToolIcons.language,
			disabled: false
		},
		{
			key: 'collapse',
			ariaLabel: t(messages, 'topbar.actions.collapse', '收起 topbar'),
			kind: 'command',
			icon: topbarToolIcons.collapse,
			disabled: false
		},
		{
			key: 'settings',
			ariaLabel: t(messages, 'topbar.actions.settings', '配置项'),
			kind: 'command',
			icon: topbarToolIcons.settings,
			disabled: false
		}
	]
}

function createDefaultSubpageActions(messages?: LocaleMessages): readonly TopbarAction[] {
	return [
		{
			key: 'language',
			ariaLabel: t(messages, 'topbar.actions.language', '语言切换'),
			kind: 'command',
			icon: topbarToolIcons.language,
			disabled: false
		},
		{
			key: 'collapse',
			ariaLabel: t(messages, 'topbar.actions.collapse', '收起 topbar'),
			kind: 'command',
			icon: topbarToolIcons.collapse,
			disabled: false
		},
		{
			key: 'home',
			ariaLabel: t(messages, 'topbar.actions.home', '返回主页'),
			kind: 'command',
			icon: topbarToolIcons.home,
			disabled: false
		}
	]
}

function resolvePageTitle(
	route: RouteState,
	data: Record<string, unknown>,
	messages?: LocaleMessages
): string {
	switch (route.kind) {
		case 'home':
			return siteConfig.name
		case 'blog':
			return t(messages, 'nav.blog', 'Blog')
		case 'archive':
			return t(messages, 'shell.section.archive', 'Archive')
		case 'post':
			return typeof data.post === 'object' &&
				data.post !== null &&
				'title' in data.post &&
				typeof data.post.title === 'string'
				? data.post.title
				: t(messages, 'shell.section.dossier', 'Dossier')
		case 'tag':
			return typeof data.tag === 'object' &&
				data.tag !== null &&
				'name' in data.tag &&
				typeof data.tag.name === 'string'
				? `#${data.tag.name}`
				: '#tag'
		case 'about':
			return t(messages, 'nav.about', 'About')
		case 'updates':
			return t(messages, 'nav.updates', 'Updates')
		case 'favorites':
			return t(messages, 'nav.favorites', 'Favorites')
		case 'debugManage':
			return 'Manage Debug'
		case 'error':
			return route.status === 404 ? 'Fallback Route' : 'System Recovery'
		default:
			return siteConfig.name
	}
}

export function createPageState({
	routeState,
	data,
	messages
}: {
	routeState: RouteState
	data: Record<string, unknown>
	messages?: LocaleMessages
}): PageState {
	const title = resolvePageTitle(routeState, data, messages)
	const isScreenRoute = routeState.kind === 'home' || routeState.kind === 'error'

	if (routeState.kind === 'home') {
		return {
			route: routeState,
			title,
			transitionKey: `${routeState.kind}:${routeState.pathname}`,
			shellMode: 'screen',
			showGlobalChrome: false,
			topbar: {
				variant: 'main',
				title,
				metrics: createSharedMetrics(data, messages),
				actions: createHomeActions(messages),
				motionPolicy: 'rich'
			}
		}
	}

	if (routeState.kind === 'error') {
		return {
			route: routeState,
			title,
			transitionKey: `${routeState.kind}:${routeState.pathname}`,
			shellMode: 'screen',
			showGlobalChrome: false,
			topbar: {
				variant: 'subpage',
				title,
				metrics: createSharedMetrics(data, messages),
				actions: createDefaultSubpageActions(messages),
				back: {
					kind: 'history',
					fallbackHref: '/'
				},
				motionPolicy: 'rich'
			}
		}
	}

	const usesSubpageScreen =
		routeState.kind === 'blog' ||
		routeState.kind === 'archive' ||
		routeState.kind === 'post' ||
		routeState.kind === 'tag' ||
		routeState.kind === 'about' ||
		routeState.kind === 'updates' ||
		routeState.kind === 'favorites' ||
		routeState.kind === 'debugManage'

	const fallbackHref =
		routeState.kind === 'archive'
			? '/blog'
			: routeState.kind === 'post'
				? '/blog'
				: routeState.kind === 'tag'
					? '/blog'
					: routeState.kind === 'about'
						? '/'
						: routeState.kind === 'updates'
							? '/'
							: routeState.kind === 'favorites'
								? '/'
								: routeState.kind === 'debugManage'
									? '/'
									: '/'

	return {
		route: routeState,
		title,
		transitionKey: `${routeState.kind}:${routeState.pathname}`,
		shellMode: isScreenRoute || usesSubpageScreen ? 'screen' : 'shell',
		showGlobalChrome: !(isScreenRoute || usesSubpageScreen),
		topbar: {
			variant: 'subpage',
			title,
			metrics: createSharedMetrics(data, messages),
			actions: createDefaultSubpageActions(messages),
			back: {
				kind: 'history',
				fallbackHref
			},
			motionPolicy: 'rich'
		}
	}
}
