import { siteConfig } from '$lib/config/site';
import { translate, type LocaleMessages } from '$lib/i18n';

import type { PageState, RouteState, TopbarAction, TopbarMetric } from './types';

function t(messages: LocaleMessages | undefined, key: string, fallback: string): string {
	if (!messages) {
		return fallback;
	}

	const translated = translate(messages, key);
	return translated === key ? fallback : translated;
}

const placeholderCount = '00';

const topbarMetricIcons = {
	articles: {
		src: '/icons/topbar/article.png',
		mode: 'mask' as const,
		tint: '#4277be'
	},
	issues: {
		src: '/icons/topbar/question_mark_green.png',
		mode: 'image' as const
	},
	contributes: {
		src: '/icons/topbar/tick_mark_yellow.png',
		mode: 'image' as const
	}
};

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
};

function createSharedMetrics(): readonly TopbarMetric[] {
	return [
		{
			key: 'articles',
			value: placeholderCount,
			ariaLabel: `站点文章数 ${placeholderCount}`,
			icon: topbarMetricIcons.articles
		},
		{
			key: 'issues',
			value: placeholderCount,
			ariaLabel: `Issue 数 ${placeholderCount}`,
			icon: topbarMetricIcons.issues
		},
		{
			key: 'contributes',
			value: placeholderCount,
			ariaLabel: `最近 contribute 数 ${placeholderCount}`,
			icon: topbarMetricIcons.contributes
		}
	];
}

function createHomeActions(): readonly TopbarAction[] {
	return [
		{
			key: 'language',
			ariaLabel: '语言切换',
			icon: topbarToolIcons.language,
			interactive: false
		},
		{
			key: 'collapse',
			ariaLabel: '收起 topbar',
			icon: topbarToolIcons.collapse,
			interactive: false
		},
		{
			key: 'settings',
			ariaLabel: '配置项',
			icon: topbarToolIcons.settings,
			interactive: false
		}
	];
}

function createDefaultSubpageActions(): readonly TopbarAction[] {
	return [
		{
			key: 'language',
			ariaLabel: '语言切换',
			icon: topbarToolIcons.language,
			interactive: false
		},
		{
			key: 'collapse',
			ariaLabel: '收起 topbar',
			icon: topbarToolIcons.collapse,
			interactive: false
		},
		{
			key: 'home',
			ariaLabel: '返回主页',
			icon: topbarToolIcons.home,
			interactive: false
		}
	];
}

function resolvePageTitle(
	route: RouteState,
	data: Record<string, unknown>,
	messages?: LocaleMessages
): string {
	switch (route.kind) {
		case 'home':
			return siteConfig.name;
		case 'blog':
			return t(messages, 'nav.blog', 'Blog');
		case 'archive':
			return t(messages, 'shell.section.archive', 'Archive');
		case 'post':
			return typeof data.post === 'object' &&
				data.post !== null &&
				'title' in data.post &&
				typeof data.post.title === 'string'
				? data.post.title
				: t(messages, 'shell.section.dossier', 'Dossier');
		case 'tag':
			return typeof data.tag === 'object' &&
				data.tag !== null &&
				'name' in data.tag &&
				typeof data.tag.name === 'string'
				? `#${data.tag.name}`
				: '#tag';
		case 'about':
			return t(messages, 'nav.about', 'About');
		case 'updates':
			return t(messages, 'nav.updates', 'Updates');
		case 'favorites':
			return t(messages, 'nav.favorites', 'Favorites');
		case 'error':
			return route.status === 404 ? 'Fallback Route' : 'System Recovery';
		default:
			return siteConfig.name;
	}
}

export function createPageState({
	routeState,
	data,
	messages
}: {
	routeState: RouteState;
	data: Record<string, unknown>;
	messages?: LocaleMessages;
}): PageState {
	const title = resolvePageTitle(routeState, data, messages);
	const isScreenRoute = routeState.kind === 'home' || routeState.kind === 'error';

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
				metrics: createSharedMetrics(),
				actions: createHomeActions(),
				motionPolicy: 'rich'
			}
		};
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
				metrics: createSharedMetrics(),
				actions: createDefaultSubpageActions(),
				back: {
					kind: 'history',
					fallbackHref: '/'
				},
				motionPolicy: 'rich'
			}
		};
	}

	const fallbackHref =
		routeState.kind === 'archive' ? '/blog'
		: routeState.kind === 'post' ? '/blog'
		: routeState.kind === 'tag' ? '/blog'
		: routeState.kind === 'about' ? '/'
		: routeState.kind === 'updates' ? '/'
		: routeState.kind === 'favorites' ? '/'
		: '/';

	return {
		route: routeState,
		title,
		transitionKey: `${routeState.kind}:${routeState.pathname}`,
		shellMode: isScreenRoute ? 'screen' : 'shell',
		showGlobalChrome: !isScreenRoute,
		topbar: {
			variant: 'subpage',
			title,
			metrics: createSharedMetrics(),
			actions: createDefaultSubpageActions(),
			back: {
				kind: 'history',
				fallbackHref
			},
			motionPolicy: 'rich'
		}
	};
}
