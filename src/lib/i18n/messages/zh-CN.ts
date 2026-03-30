export const zhCNMessages = {
	meta: {
		localeName: '简体中文'
	},
	nav: {
		home: '首页',
		blog: '分类',
		updates: '动态',
		favorites: '收藏',
		about: '关于'
	},
	blog: {
		archive: {
			short: '文章'
		}
	},
	common: {
		back: '返回',
		home: '主页',
		published: '发布于',
		updated: '更新于',
		readingTime: '阅读时间'
	},
	shell: {
		brand: {
			tagline: 'Command Center'
		},
		aria: {
			primaryNav: '主导航',
			quickNav: '快捷入口'
		},
		status: {
			current: 'Current',
			mode: 'Mode',
			stack: 'Stack',
			deploy: 'Deploy'
		},
		section: {
			archive: '归档',
			dossier: '档案',
			interface: '界面'
		},
		toggle: {
			expand: 'Expand',
			collapse: 'Collapse'
		},
		footer: {
			lead: 'Light futuristic command center for articles, logs, and curated references.',
			detail: 'Built with SvelteKit, mdsvex, schema validation, and prerender-first routing.'
		}
	},
	home: {
		mode: {
			main: '主界面',
			subpage: '子页面'
		},
		action: {
			enterContent: '进入内容'
		}
	},
	topbar: {
		actions: {
			language: '语言切换',
			collapse: '收起 topbar',
			settings: '配置项',
			home: '返回主页',
			expand: '展开 topbar'
		},
		metrics: {
			articles: '站点文章数',
			todos: '待办事项数',
			recentActivity: '最近 30 天更新/新增文章数'
		},
		settings: {
			title: '站点配置',
			close: '关闭配置',
			cursor: 'Cursor Style',
			cursorDescription: '在站点自定义指针与浏览器默认光标之间切换。',
			custom: 'Custom',
			system: 'System',
			backgroundAnimation: 'Background Animation',
			backgroundAnimationDescription: '为首页启用 Spine 背景动画增强层。',
			backgroundAnimationOn: 'On',
			backgroundAnimationOff: 'Off',
			backgroundAnimationDisabled: '当前在 compact 布局或减动效模式下自动停用。',
			backgroundAnimationFailed: '资源加载失败，已回退到默认背景。',
			manage: 'Manage 工作台',
			manageDescription: '打开内容维护面板，进入文章列表、编辑器与仓库写入流程。',
			manageAction: '进入'
		}
	},
	error: {
		notFound: '未找到页面~ (´・ω・`)',
		failure: '系统故障了 (´；ω；`)'
	}
} as const
