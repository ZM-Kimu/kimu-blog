import type { FavoriteEntry } from '$lib/types/info-flow'

export const favoriteEntries = [
	{
		id: 'sveltekit-docs',
		title: 'SvelteKit Documentation',
		description: '路由、load、prerender 与 adapter 边界的主要参考。',
		href: 'https://svelte.dev/docs/kit',
		kind: 'reference',
		sourceLabel: 'svelte.dev',
		collection: 'engineering',
		added: '2026-07-10'
	},
	{
		id: 'cloudflare-pages-sveltekit',
		title: 'Cloudflare Pages + SvelteKit',
		description: 'Cloudflare Pages 上部署 SvelteKit 站点的官方路径。',
		href: 'https://developers.cloudflare.com/pages/framework-guides/deploy-a-svelte-kit-site/',
		kind: 'reference',
		sourceLabel: 'Cloudflare Docs',
		collection: 'engineering',
		added: '2026-07-09'
	},
	{
		id: 'archive-page',
		title: '完整归档',
		description: '当前站点的高效率文章浏览入口，用于沉淀全部内容记录。',
		href: '/blog/archive',
		kind: 'article',
		sourceLabel: 'Kimu Blog',
		collection: 'site',
		added: '2026-07-08'
	},
	{
		id: 'mdn-css-grid',
		title: 'CSS Grid Layout',
		description: '复杂信息流和响应式分区布局的基础参考。',
		href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout',
		kind: 'reference',
		sourceLabel: 'MDN',
		collection: 'interface',
		added: '2026-07-06'
	},
	{
		id: 'motion-token-system',
		title: 'Motion Token System',
		description: '当前项目的动效 token 与 CSS 变量生成机制。',
		href: '/blog/archive?category=engineering',
		kind: 'article',
		sourceLabel: 'Kimu Blog',
		collection: 'site',
		added: '2026-07-04'
	},
	{
		id: 'game-ui-reference',
		title: 'Game UI reference board',
		description: '用于校准 command center、dock、panel 和信息密度的视觉参考集合。',
		href: '/favorites',
		kind: 'site',
		sourceLabel: 'Local vault',
		collection: 'interface',
		added: '2026-07-02'
	}
] satisfies readonly FavoriteEntry[]
