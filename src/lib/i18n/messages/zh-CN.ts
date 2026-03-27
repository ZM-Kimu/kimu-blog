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
	error: {
		notFound: '未找到页面~ (´・ω・`)',
		failure: '系统故障了 (´；ω；`)'
	}
} as const
