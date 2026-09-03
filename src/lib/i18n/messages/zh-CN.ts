import type { AppMessages } from './schema'

export const zhCNMessages = {
	meta: {
		localeName: '简体中文'
	},
	common: {
		back: '返回',
		all: '全部',
		home: '主页',
		close: '关闭',
		info: 'Info',
		featured: '精选',
		published: '已发布',
		updated: '更新',
		record: '记录',
		recordsLabel: '记录数',
		status: '状态',
		uncategorized: '未分类',
		publishedAt: '发布于 {date}',
		updatedAt: '更新于 {date}',
		author: '作者',
		category: '分类',
		readingTime: '阅读时间',
		readingMinutes: '{count} 分钟',
		slug: 'Slug',
		tagCount: '{count} 个标签',
		renderMode: '渲染模式',
		prerender: '预渲染',
		records: '{count} 条记录',
		totalRecords: '{count} 条总记录',
		visibleRecords: '显示 {count} 条',
		logs: '{count} 条日志',
		pendingSlug: '待生成 slug',
		noTagsYet: '暂无标签',
		untitledDraft: '未命名草稿',
		summaryPlaceholder: '这里会显示摘要和导语。',
		states: {
			live: '在线',
			standby: '待命',
			comingSoon: '即将开放'
		},
		categories: {
			development: '开发',
			daily: '日常',
			notes: '笔记'
		}
	},
	nav: {
		home: '首页',
		blog: '分类',
		updates: '动态',
		favorites: '收藏',
		about: '关于',
		tags: '标签'
	},
	shell: {
		brand: {
			tagline: 'Command Center'
		},
		aria: {
			primaryNav: '主导航',
			quickNav: '快捷入口'
		},
		portraitHint: {
			desktop: '建议浏览器窗口比例 16:9 横向浏览更佳。',
			mobile: '建议切换横屏浏览更佳。'
		},
		status: {
			current: '当前区段',
			mode: '模式',
			modeValue: '在线',
			stack: '技术栈',
			stackValue: 'SvelteKit',
			deploy: '部署',
			deployValue: 'Pages'
		},
		section: {
			archive: '归档',
			dossier: '档案',
			interface: '界面'
		},
		toggle: {
			expand: '展开',
			collapse: '收起'
		},
		footer: {
			lead: '以轻量未来感 command center 组织文章、日志与精选参考资料。',
			detail: '基于 SvelteKit、mdsvex、schema 校验与 prerender-first 路由构建。'
		}
	},
	home: {
		mode: {
			main: '主界面',
			subpage: '子页面'
		},
		action: {
			enterContent: '进入内容',
			badge: 'Main',
			enterBlog: '进入分类'
		},
		banner: {
			featured: '精选',
			missionAria: 'Mission 横幅',
			footerAria: '主入口',
			heightGuardEyebrow: 'Viewport Guard',
			heightGuardTitle: '当前窗口空间不足',
			heightGuardDescription: '当前窗口大小无法正常使用此网站，请调大浏览器窗口。',
			heightGuardPrimary: '进入内容页',
			heightGuardSecondary: '查看简介'
		},
		profile: {
			info: 'Info'
		},
		music: {
			emptyTitle: '暂无曲目',
			play: '播放',
			pause: '暂停',
			previous: '上一首',
			next: '下一首',
			progress: '播放进度',
			volume: '音量',
			mute: '静音',
			unmute: '取消静音'
		},
		missions: {
			development: {
				title: '开发',
				kicker: 'Mission 01',
				description: 'SvelteKit、Cloudflare、工具链、架构记录与实现日志。',
				state: '在线'
			},
			daily: {
				title: '日常',
				kicker: 'Mission 02',
				description: '交互研究、布局思路、字体选择与样式系统记录。',
				state: '待命'
			},
			notes: {
				title: '笔记',
				kicker: 'Mission 03',
				description: '短篇观察、参考摘录、实验记录与个人笔记。',
				state: '待命'
			},
			favorites: {
				title: 'Favorites',
				kicker: 'Mission 04',
				description: '精选链接、收藏参考与灵感归档。',
				state: '即将开放'
			}
		}
	},
	topbar: {
		aria: {
			main: '主界面 topbar',
			subpage: '子页面 topbar',
			resources: '主页资源指标',
			actions: '主页 topbar 操作',
			back: '返回上一页'
		},
		actions: {
			language: '语言切换',
			collapse: '收起 topbar',
			settings: '打开配置',
			home: '返回主页',
			expand: '展开 topbar'
		},
		metrics: {
			articles: '站点文章数',
			recentActiveArticles: '最近活跃文章数',
			recentUpdates: '最近动态数'
		},
		settings: {
			title: '站点配置',
			close: '关闭配置',
			cursor: '指针样式',
			cursorDescription: '在站点自定义指针与浏览器默认光标之间切换。',
			custom: '自定义',
			system: '系统',
			backgroundAnimation: '背景动画',
			backgroundAnimationDescription: '为首页启用 Spine 背景动画增强层。',
			backgroundAnimationOn: '开启',
			backgroundAnimationOff: '关闭',
			backgroundAnimationDisabled: '当前在 portrait 文档流布局或减动效模式下自动停用。',
			backgroundAnimationFailed: '资源加载失败，已回退到默认背景。',
			manage: 'Manage 工作台',
			manageDescription: '进入文章管理页。',
			manageAction: '进入'
		}
	},
	blog: {
		archive: {
			short: '归档',
			introEyebrow: 'Archive',
			introTitle: '完整归档',
			introDescription: '分类界面负责入口与选择，这里负责高效率浏览全部文章记录。',
			backToBlog: '返回分类界面',
			openPost: '进入文章',
			categoryEyebrow: '分类',
			tagsScrollHint: '滑动',
			emptyDate: '暂无内容...',
			emptyTitle: '等待内容接入',
			emptyDescription: '这个分类已经预留，但当前还没有正式文章。',
			yearEyebrow: '年份索引',
			yearTitle: '按年份浏览'
		},
		mission: {
			introEyebrow: 'Mission Page',
			introTitle: '内容分类界面',
			introDescription:
				'这里承担主分类选择，而不是传统博客文章流。一级卡片代表主要内容分区，完整时间顺序浏览下沉到归档页。',
			archiveCta: '进入完整归档',
			homeCta: '返回主界面',
			boardEyebrow: 'Primary Categories',
			boardTitle: 'Mission Board',
			recentEyebrow: 'Recent Output',
			recentTitle: 'Latest Records',
			cards: {
				development: {
					title: '开发'
				},
				daily: {
					title: '日常'
				},
				notes: {
					title: '笔记'
				},
				favorites: {
					title: '收藏'
				}
			}
		},
		post: {
			headerEyebrow: 'Article Record',
			backArchive: '返回归档',
			listEyebrow: 'Article Index',
			listTitle: '文章列表',
			descriptionLabel: '简介',
			seriesLabel: '系列',
			seriesNewer: '上一篇',
			seriesOlder: '下一篇',
			asideEyebrow: 'content 无关内容',
			statusFeatured: '精选',
			statusPublished: '已发布',
			metadataEyebrow: 'Metadata',
			metadataTitle: '文章情报',
			tagsEyebrow: 'Tag Matrix',
			tagsTitle: '标签入口',
			relatedEyebrow: 'Related Output',
			relatedTitle: '相关记录',
			relatedEmptyTitle: '等待更多记录',
			relatedEmptyDescription: '后续有更多文章后，这里会显示相关推荐。'
		},
		tag: {
			introEyebrow: 'Tag Filter',
			introDescription: '有 {count} 篇文章包含了此标签',
			backArchive: '返回归档'
		}
	},
	about: {
		title: 'Kimu Profile',
		personalTitle: '个人',
		githubAriaLabel: 'GitHub: {account}',
		githubFooterLabel: 'Github',
		techStackTitle: '技术栈',
		entertainmentTitle: '其他',
		emailAriaLabel: '发送邮件到 {email}',
		mailFooterLabel: 'Mail',
		maimaiImageAlt: 'MaiMai DX Rating 图片'
	},
	updates: {
		title: '动态',
		description: '站点改动、正在推进的任务、短状态与最近变化会在这里汇总成一条可扫描的时间线。',
		summaryAria: '动态概览',
		totalLabel: '总动态',
		latestLabel: '最近更新',
		feedAria: '动态时间线',
		openItem: '打开动态：{title}',
		openLabel: '进入',
		emptyTitle: '暂无动态',
		emptyDescription: '还没有发布任何动态记录。'
	},
	favorites: {
		title: '收藏',
		description: '收藏内容按标签整理，便于快速回访文章、工具、外部参考与站内入口。',
		summaryAria: '收藏概览',
		totalLabel: '总收藏',
		filtersLabel: '收藏标签筛选',
		collectionsAria: '收藏标签',
		openItem: '打开收藏：{title}',
		emptyTitle: '暂无收藏',
		emptyDescription: '当前标签下没有收藏条目。'
	},
	error: {
		title: '错误',
		eyebrowNotFound: 'Route Lost',
		eyebrowFault: 'Unhandled Fault',
		headlineNotFound: '未找到页面~ (´・ω・`)',
		headlineFault: '系统故障 (´；ω；`)',
		headlineInterrupted: '系统中断 (´；ω；`)',
		detailNotFound: '请求的页面不存在。',
		detailUnknown: '发生了未知错误。',
		detailFallback: '页面发生错误，fallback 页面已接管。',
		visualAltFault: 'Arona 表情插画，用于 500 错误页展示。',
		visualAltGeneric: 'Arona 的弹窗插画，用于错误页的引导展示。',
		fallbackIllustration: 'Fallback 插画'
	},
	manage: {
		nav: {
			ariaLabel: '内容管理',
			posts: '文章',
			updates: '动态',
			favorites: '收藏'
		},
		records: {
			common: {
				loading: '加载中…',
				retry: '重新载入',
				save: '保存',
				delete: '删除',
				committed: '已提交 {sha}',
				confirm: {
					create: '确认创建并发布这条记录？',
					edit: '确认保存并发布当前更改？',
					delete: '确认删除“{title}”？这会直接提交到仓库。'
				}
			},
			updates: {
				count: '{count}条动态',
				create: '新建动态',
				searchLabel: '搜索动态',
				searchPlaceholder: '搜索标题、内容、标签或标识…',
				empty: '没有匹配的动态。'
			},
			favorites: {
				count: '{count}项收藏',
				create: '新建收藏',
				searchLabel: '搜索收藏',
				searchPlaceholder: '搜索标题、简介、来源或标识…',
				empty: '没有匹配的收藏。'
			},
			fields: {
				title: '标题',
				id: '记录标识',
				date: '发布日期',
				added: '收藏日期',
				project: '项目',
				progress: '项目进度',
				summary: '内容',
				description: '简介',
				tags: '标签',
				href: '链接',
				sourceLabel: '来源名称'
			},
			placeholders: {
				tags: '设计, 站点, 进度',
				href: 'https://… 或 /blog/…',
				hrefOptional: '可选：https://… 或 /blog/…',
				favoriteTags: '输入标签，按 Enter 创建'
			}
		},
		groups: {
			none: '不加入分组',
			createProject: '创建项目',
			createSeries: '创建系列',
			rename: '重命名',
			renameSave: '保存新名称',
			renameCancel: '取消重命名',
			confirmRename: '确认将“{name}”改名为“{next}”？这会直接提交到仓库。'
		},
		shell: {
			eyebrow: 'Private Content Workbench',
			title: 'Manage / {repo}',
			description: '当前以 {actor} 身份接入，写入目标为 {owner}/{repo} on {branch}。',
			navAria: '管理导航',
			navContent: '内容',
			navPosts: '文章',
			backPublic: '返回公开站'
		},
		list: {
			eyebrow: 'Repository Records',
			title: '文章列表',
			loadingTitle: '加载中…',
			errorTitle: '文章列表装载失败',
			search: '搜索',
			searchPlaceholder: '搜索标题、slug 或分类…',
			articleCount: '{count}篇文章',
			newPost: '新建文章',
			retry: '重新载入',
			noMatchesTitle: '没有匹配结果',
			noMatchesDescription: '当前筛选条件下没有文章。',
			draft: 'draft',
			featured: 'featured'
		},
		editor: {
			createTitle: '新建文章',
			editTitle: '编辑 {slug}',
			loadingTitle: '加载中…',
			errorTitle: '文章内容装载失败',
			createSubmit: '创建文章',
			saveChanges: '保存更改',
			submitting: '提交中…',
			delete: '删除',
			retry: '重新载入',
			source: '正文内容',
			tabs: {
				ariaLabel: '文章编辑模式',
				information: '信息',
				content: '内容'
			},
			previewVisibility: {
				show: '展开预览',
				hide: '关闭预览'
			},
			confirmSubmit: {
				create: '确认创建并提交这篇文章？',
				update: '确认保存并提交当前更改？'
			},
			slugStatus: {
				checking: '正在检查路径…',
				available: '路径可用',
				invalid: '路径标识格式无效',
				duplicate: '路径标识已存在',
				unavailable: '暂时无法检查路径，请稍后重试'
			},
			fields: {
				title: '标题',
				slug: '路径标识',
				description: '摘要',
				date: '发布日期',
				updated: '更新日期',
				category: '分类',
				author: '作者',
				series: '系列',
				readingMinutes: '阅读时间（分钟）',
				format: '格式',
				tags: '标签',
				cover: '封面'
			},
			placeholders: {
				readingMinutes: '6',
				tags: 'svelte, cloudflare, 开发日志',
				cover: '请从内容设置中设置封面'
			},
			toggles: {
				draft: '草稿',
				featured: '精选',
				toc: '文章目录'
			},
			uploads: {
				title: '图片与占位符',
				pickFiles: '选择图片',
				dropTitle: '拖放图片到这里',
				dropDescription: '或点击选择图片，支持 PNG、JPEG、WebP、AVIF 与 GIF',
				setCover: '设为封面',
				insertBody: '插入正文',
				remove: '移除'
			},
			statusCommitted: '已提交 {sha}，最新内容已同步到仓库。',
			errors: {
				genericSave: '保存失败，请稍后重试。',
				shaConflict: '仓库中的文章已经变化，请刷新当前页面后重新编辑。',
				deleteConfirm: '确认删除文章 {slug}？这会直接提交到仓库。'
			}
		},
		preview: {
			empty: '当前没有可渲染的正文。',
			placeholders: {
				description: '预览面板不会执行这段 mdsvex / Svelte 逻辑。',
				scriptBlock: '<script> 区块',
				styleBlock: '<style> 区块',
				componentBlock: '{name} 组件'
			}
		},
		debug: {
			actorName: '调试操作员',
			eyebrow: 'Debug Sandbox',
			title: 'Manage 样式调试',
			editorMode: 'Editor Mode',
			copyVariant: 'Copy Variant',
			visualState: 'Visual State',
			preview: 'Preview',
			visible: 'Visible',
			hidden: 'Hidden',
			edit: 'Edit',
			create: 'Create',
			default: 'Default',
			long: 'Long',
			empty: 'Empty',
			states: {
				idle: 'idle',
				success: 'success',
				error: 'error',
				loading: 'loading',
				disabled: 'disabled'
			},
			successState: '已进入本地成功态，不会写入仓库。',
			errorState: '本地错误态：用于检查 editor 提示样式。',
			baseSource: `## 当前调试目标

- 检查 manage shell 的头部密度
- 检查 editor / preview 之间的列宽关系
- 检查长文案、空态、错误态与加载态的视觉表现

![debug-cover](/images/og-default.svg)
`,
			categories: {
				workbench: 'Workbench',
				drafts: 'Drafts',
				archive: 'Archive'
			},
			documents: {
				defaultTitle: 'Manage 调试样稿',
				longTitle: '这是一个用于调试 manage 编辑器布局与多行标题表现的超长标题样本',
				defaultDescription: '用于本地调试样式和交互状态的 mock 文稿。',
				longDescription:
					'这是一段更长的摘要文本，用来观察编辑器字段、预览头部以及 manage 沙盒在长文案条件下的断行、密度和节奏。',
				draftTitle: '草稿样本',
				draftDescription: '草稿态、普通长度、非 featured。',
				archiveTitle: '归档样本',
				archiveDescription: '用于观察不同分类 chip 的密度。',
				emptyTitle: '空内容样本',
				emptyDescription: '用于观察空内容文档在列表中的常规表现。'
			}
		},
		errors: {
			accessUnauthorized: 'Cloudflare Access 校验未通过。',
			manageRequestFailed: 'Manage 请求失败。',
			postListLoadFailed: '文章列表加载失败。',
			postLoadFailed: '文章内容加载失败。',
			recordListLoadFailed: '记录列表加载失败。',
			recordLoadFailed: '记录内容加载失败。',
			recordNotFound: '记录不存在。',
			duplicateRecordId: '记录标识已存在。',
			invalidRecord: '仓库中的记录格式无效。',
			invalidRecordKind: '不支持此记录类型。',
			invalidRecordId: '记录标识无效。',
			invalidGroup: '仓库中的分组格式无效。',
			invalidGroupId: '分组标识无效。',
			invalidGroupKind: '不支持此分组类型。',
			invalidGroupName: '分组名称无效。',
			groupNotFound: '分组不存在。',
			duplicateGroupName: '已存在同名分组。',
			duplicateGroupId: '自动生成的分组标识已被占用，请调整名称。',
			missingGroupName: '创建分组时必须提供名称。',
			sessionInitFailed: '管理会话初始化失败。',
			invalidContentType: '请求必须使用 multipart/form-data。',
			missingPayload: '缺少 payload JSON 字段。',
			invalidPayloadJson: 'payload 必须是合法 JSON。',
			invalidPayload: 'payload 校验失败。',
			invalidSlug: 'slug 非法。',
			postNotFound: '文章不存在。',
			duplicateSlug: 'slug 已存在。',
			pathConflict: '目标路径已存在。',
			shaConflict: 'expectedSha 与当前文件不一致。',
			duplicateUploadName: '存在重复上传文件名。',
			invalidUploadName: '图片文件名非法。',
			invalidUploadSize: '上传图片超过大小限制。',
			invalidUploadType: '图片类型不受支持。',
			invalidCoverPath: 'cover 必须是站内绝对路径。',
			missingCoverPath: 'cover 指向的资源不存在。',
			invalidSource: '正文源码不合法。',
			unresolvedUploadReference: '存在未解析的 upload:// 引用。',
			missingPlatformEnv: '当前运行时没有 Cloudflare env 绑定。',
			missingManageEnv: 'Manage 所需环境变量缺失。',
			githubRequestFailed: 'GitHub 请求失败。',
			githubTreeTruncated: 'GitHub tree 结果被截断。',
			branchConflict: '目标分支写入冲突。',
			invalidOrigin: 'Origin 校验失败。',
			invalidFetchSite: 'Sec-Fetch-Site 校验失败。',
			invalidCsrf: 'CSRF 校验失败。',
			csrfRequired: '缺少浏览器来源校验或 service token。',
			internalError: '发生未知内部错误。'
		}
	},
	seo: {
		home: {
			description: 'Kimu Blog 的主界面。以 game home screen 的方式组织个人信息、动态和内容入口。'
		},
		about: {
			title: '个人资料',
			description: 'Kimu 的个人与其他信息。'
		},
		blog: {
			title: '分类界面',
			description: '以 mission board 的方式浏览 Kimu Blog 的内容分类与最近记录。'
		},
		archive: {
			title: '完整归档',
			description: '按分类与年份浏览 Kimu Blog 的全部文章记录。'
		},
		updates: {
			title: '动态',
			description: '浏览 Kimu Blog 的站点动态、进行中任务与最近状态变化。'
		},
		favorites: {
			title: '收藏',
			description: '浏览 Kimu Blog 的精选链接、站内入口、工具与灵感参考。'
		},
		manageDebug: {
			title: 'Manage Debug',
			description: '用于本地调试 manage 视觉、布局和交互状态的单页沙盒。'
		},
		tag: {
			title: '标签：{tag}',
			description: '浏览标签 {tag} 下的文章。'
		},
		error: {
			notFoundTitle: '404 / Not Found',
			notFoundDescription: '请求的路径不存在。',
			statusTitle: '错误 {status}',
			statusDescription: '页面发生错误，fallback 页面已接管。'
		}
	},
	a11y: {
		home: {
			missionBanner: 'Mission 横幅',
			musicPlayer: '主页音乐播放器',
			footerNav: '主入口'
		}
	}
} satisfies AppMessages
