import type { UpdateEntry } from '$lib/types/info-flow'

export const updateEntries = [
	{
		id: 'subpage-info-flow-v1',
		date: '2026-07-13',
		kind: 'design',
		status: 'live',
		title: '动态与收藏页面信息流设计',
		summary: '将动态和收藏从占位页推进为同骨架差异化页面：动态走时间线，收藏走精选与分组收藏板。',
		tags: ['subpage', 'information-flow', 'design'],
		href: '/updates'
	},
	{
		id: 'home-dock-icon-pass',
		date: '2026-07-12',
		kind: 'site',
		status: 'shipped',
		title: '主页 dock 图标样式整理',
		summary: '主页 dock 入口改为图标加描边字体，去掉圆形背景，让一级入口更接近当前 game UI 方向。',
		tags: ['home', 'dock', 'visual-system'],
		href: '/'
	},
	{
		id: 'archive-scroll-debug',
		date: '2026-07-11',
		kind: 'work',
		status: 'tracking',
		title: '归档底部选择滚动稳定性排查',
		summary: '继续跟踪 archive entry column 底部点击时的 reader rail 越界与布局跳动问题。',
		tags: ['archive', 'scroll', 'qa'],
		href: '/blog/archive'
	},
	{
		id: 'tag-history-navigation',
		date: '2026-07-10',
		kind: 'site',
		status: 'shipped',
		title: '标签页返回路径修正',
		summary: '顶部返回按钮跳过连续 tag 历史，回到进入标签页之前的非 tag 页面。',
		tags: ['tags', 'navigation', 'history'],
		href: '/tags/engineering'
	},
	{
		id: 'article-dossier-polish',
		date: '2026-07-08',
		kind: 'writing',
		status: 'queued',
		title: '文章档案页视觉继续细化',
		summary:
			'下一轮会把文章详情页的 dossier 结构、相关记录和 metadata rail 继续统一到当前视觉语言。',
		tags: ['article', 'dossier', 'visual-system'],
		href: '/blog/archive'
	},
	{
		id: 'favorites-stat-layout-pass',
		date: '2026-07-07',
		kind: 'design',
		status: 'shipped',
		title: '收藏页统计胶囊布局调整',
		summary:
			'收藏页顶部统计改为单行布局，并将数字移动到标签右侧，用于校准 compact panel 的信息密度。',
		tags: ['favorites', 'stats', 'layout'],
		href: '/favorites'
	},
	{
		id: 'updates-panel-merge-pass',
		date: '2026-07-06',
		kind: 'site',
		status: 'live',
		title: '动态页单 panel 信息流测试',
		summary:
			'动态页合并顶部上下 panel，移除筛选、tag row 与 action，验证纯时间线在受控滚动区内的表现。',
		tags: ['updates', 'panel', 'timeline'],
		href: '/updates'
	},
	{
		id: 'home-footer-spacing-review',
		date: '2026-07-05',
		kind: 'design',
		status: 'tracking',
		title: '主页 footer 与播放器间距复核',
		summary: '继续对齐 home mini player 与 footer 的左侧留白，确保 dock 偏移后整体重心仍然稳定。',
		tags: ['home', 'footer', 'spacing'],
		href: '/'
	},
	{
		id: 'dock-asset-normalization',
		date: '2026-07-03',
		kind: 'site',
		status: 'shipped',
		title: 'Dock 图标资源命名规范化',
		summary: '将标签、收藏、动态与归档的 dock 图标整理为统一命名，减少静态资源引用的歧义。',
		tags: ['assets', 'dock', 'naming'],
		href: '/'
	},
	{
		id: 'favorites-hover-overlay',
		date: '2026-07-01',
		kind: 'design',
		status: 'shipped',
		title: '收藏卡片 hover 光效改造',
		summary: '收藏条目的 hover 从位移改为透明度驱动的渐变光效，保留全局按压缩放作为统一交互反馈。',
		tags: ['favorites', 'hover', 'motion'],
		href: '/favorites'
	},
	{
		id: 'subpage-route-motion-audit',
		date: '2026-06-29',
		kind: 'work',
		status: 'tracking',
		title: '子页面进入退出动效审查',
		summary:
			'检查收藏、动态、标签等子页面的 route layer 动画是否完整保留 animation-name 与 duration。',
		tags: ['motion', 'subpage', 'qa'],
		href: '/favorites'
	},
	{
		id: 'favorites-content-swap-motion',
		date: '2026-06-27',
		kind: 'design',
		status: 'shipped',
		title: '收藏分类切换动效稳定',
		summary:
			'收藏列表分类切换使用透明度、轻位移与 blur，避免切换过程中卡片宽高被 outgoing panel 拉伸。',
		tags: ['favorites', 'motion', 'layout'],
		href: '/favorites'
	},
	{
		id: 'archive-category-key-test',
		date: '2026-06-25',
		kind: 'work',
		status: 'queued',
		title: '归档分类切换滚动复测',
		summary: '为归档页分类切换准备更长列表场景，复测底部起始位置下 viewport 是否发生瞬时越界。',
		tags: ['archive', 'scroll', 'test'],
		href: '/blog/archive'
	},
	{
		id: 'tag-back-history-coverage',
		date: '2026-06-23',
		kind: 'site',
		status: 'shipped',
		title: '标签返回历史覆盖用例',
		summary:
			'补充连续 tag path 切换后的返回行为验证，确保 back action 跳过 tag 历史并回到来源页面。',
		tags: ['tags', 'history', 'navigation'],
		href: '/tags/design'
	},
	{
		id: 'info-flow-density-tuning',
		date: '2026-06-21',
		kind: 'design',
		status: 'tracking',
		title: '信息流密度与卡片尺寸调校',
		summary: '用更长的动态数据检查 timeline 在桌面和移动端的节奏、卡片间距与滚动舒适度。',
		tags: ['updates', 'density', 'responsive'],
		href: '/updates'
	},
	{
		id: 'scroll-chrome-feed-regression',
		date: '2026-06-19',
		kind: 'work',
		status: 'live',
		title: 'ScrollChrome 信息流回归检查',
		summary: '通过动态页长列表验证 ScrollChrome 在 subpage shell 内的高度计算、滚动条与内容裁切。',
		tags: ['scroll-chrome', 'updates', 'regression'],
		href: '/updates'
	},
	{
		id: 'public-copy-cleanup',
		date: '2026-06-17',
		kind: 'writing',
		status: 'queued',
		title: '公开页文案层级清理',
		summary: '整理动态与收藏页里不需要的标题模板和说明文本，避免小型 eyebrow 风格回流。',
		tags: ['copy', 'subpage', 'i18n'],
		href: '/updates'
	},
	{
		id: 'game-ui-panel-consistency',
		date: '2026-06-15',
		kind: 'design',
		status: 'tracking',
		title: 'Game UI 面板一致性观察',
		summary:
			'对 home dock、subpage panel、信息卡片与 topbar 的边框、阴影和 glass 层级做一致性观察。',
		tags: ['visual-system', 'game-ui', 'panel'],
		href: '/'
	}
] satisfies readonly UpdateEntry[]
