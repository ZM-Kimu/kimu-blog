type StringLeaves<T> = {
	[K in keyof T]: T[K] extends Record<string, unknown> ? StringLeaves<T[K]> : string
}

export const appMessageSkeleton = {
	meta: {
		localeName: ''
	},
	common: {
		back: '',
		home: '',
		close: '',
		info: '',
		featured: '',
		published: '',
		updated: '',
		record: '',
		recordsLabel: '',
		status: '',
		uncategorized: '',
		publishedAt: '',
		updatedAt: '',
		author: '',
		category: '',
		slug: '',
		tagCount: '',
		renderMode: '',
		prerender: '',
		records: '',
		totalRecords: '',
		visibleRecords: '',
		logs: '',
		pendingSlug: '',
		noTagsYet: '',
		untitledDraft: '',
		summaryPlaceholder: '',
		states: {
			live: '',
			standby: '',
			comingSoon: ''
		}
	},
	nav: {
		home: '',
		blog: '',
		updates: '',
		favorites: '',
		about: ''
	},
	shell: {
		brand: {
			tagline: ''
		},
		aria: {
			primaryNav: '',
			quickNav: ''
		},
		portraitHint: {
			desktop: '',
			mobile: ''
		},
		status: {
			current: '',
			mode: '',
			modeValue: '',
			stack: '',
			stackValue: '',
			deploy: '',
			deployValue: ''
		},
		section: {
			archive: '',
			dossier: '',
			interface: ''
		},
		toggle: {
			expand: '',
			collapse: ''
		},
		footer: {
			lead: '',
			detail: ''
		}
	},
	home: {
		mode: {
			main: '',
			subpage: ''
		},
		action: {
			enterContent: '',
			badge: '',
			enterBlog: ''
		},
		banner: {
			featured: '',
			missionAria: '',
			footerAria: '',
			heightGuardEyebrow: '',
			heightGuardTitle: '',
			heightGuardDescription: '',
			heightGuardPrimary: '',
			heightGuardSecondary: ''
		},
		profile: {
			info: ''
		},
		missions: {
			engineering: {
				title: '',
				kicker: '',
				description: '',
				state: ''
			},
			designLog: {
				title: '',
				kicker: '',
				description: '',
				state: ''
			},
			fieldNotes: {
				title: '',
				kicker: '',
				description: '',
				state: ''
			},
			favorites: {
				title: '',
				kicker: '',
				description: '',
				state: ''
			}
		}
	},
	topbar: {
		aria: {
			main: '',
			subpage: '',
			resources: '',
			actions: '',
			back: ''
		},
		actions: {
			language: '',
			collapse: '',
			settings: '',
			home: '',
			expand: ''
		},
		metrics: {
			articles: '',
			todos: '',
			recentActivity: ''
		},
		settings: {
			title: '',
			close: '',
			cursor: '',
			cursorDescription: '',
			custom: '',
			system: '',
			backgroundAnimation: '',
			backgroundAnimationDescription: '',
			backgroundAnimationOn: '',
			backgroundAnimationOff: '',
			backgroundAnimationDisabled: '',
			backgroundAnimationFailed: '',
			manage: '',
			manageDescription: '',
			manageAction: ''
		}
	},
	blog: {
		archive: {
			short: '',
			introEyebrow: '',
			introTitle: '',
			introDescription: '',
			backToBlog: '',
			categoryEyebrow: '',
			emptyDate: '',
			emptyTitle: '',
			emptyDescription: '',
			yearEyebrow: '',
			yearTitle: ''
		},
		mission: {
			introEyebrow: '',
			introTitle: '',
			introDescription: '',
			archiveCta: '',
			homeCta: '',
			boardEyebrow: '',
			boardTitle: '',
			recentEyebrow: '',
			recentTitle: ''
		},
		post: {
			heroEyebrow: '',
			backArchive: '',
			statusFeatured: '',
			statusPublished: '',
			metadataEyebrow: '',
			metadataTitle: '',
			tagsEyebrow: '',
			tagsTitle: '',
			relatedEyebrow: '',
			relatedTitle: '',
			relatedEmptyTitle: '',
			relatedEmptyDescription: ''
		},
		tag: {
			introEyebrow: '',
			introDescription: '',
			backArchive: ''
		}
	},
	about: {
		heroEyebrow: '',
		backHome: '',
		title: '',
		description: '',
		systemsEyebrow: '',
		systemsTitle: '',
		nextEyebrow: '',
		nextTitle: '',
		items: {
			cloudflarePages: '',
			mdsvex: '',
			schemaValidation: '',
			entries: '',
			gameUi: '',
			replacePlaceholders: '',
			profileData: '',
			realContent: '',
			searchCommentsAnalytics: ''
		}
	},
	updates: {
		eyebrow: '',
		title: '',
		description: ''
	},
	favorites: {
		eyebrow: '',
		title: '',
		description: ''
	},
	error: {
		title: '',
		eyebrowNotFound: '',
		eyebrowFault: '',
		headlineNotFound: '',
		headlineFault: '',
		headlineInterrupted: '',
		detailNotFound: '',
		detailUnknown: '',
		detailFallback: '',
		visualAltFault: '',
		visualAltGeneric: '',
		fallbackIllustration: ''
	},
	manage: {
		shell: {
			eyebrow: '',
			title: '',
			description: '',
			navAria: '',
			navContent: '',
			navPosts: '',
			backPublic: ''
		},
		list: {
			eyebrow: '',
			title: '',
			loadingTitle: '',
			loadingDescription: '',
			errorTitle: '',
			search: '',
			searchPlaceholder: '',
			newPost: '',
			retry: '',
			noMatchesTitle: '',
			noMatchesDescription: '',
			draft: '',
			featured: ''
		},
		editor: {
			eyebrow: '',
			createTitle: '',
			editTitle: '',
			loadingTitle: '',
			loadingDescription: '',
			errorTitle: '',
			createSubmit: '',
			saveChanges: '',
			submitting: '',
			delete: '',
			retry: '',
			source: '',
			fields: {
				title: '',
				description: '',
				date: '',
				updated: '',
				category: '',
				author: '',
				series: '',
				readingTime: '',
				canonical: '',
				format: '',
				tags: '',
				cover: ''
			},
			placeholders: {
				category: '',
				readingTime: '',
				canonical: '',
				tags: '',
				cover: ''
			},
			toggles: {
				draft: '',
				featured: '',
				toc: ''
			},
			uploads: {
				eyebrow: '',
				title: '',
				pickFiles: '',
				setCover: '',
				insertBody: '',
				remove: '',
				empty: ''
			},
			statusCommitted: '',
			errors: {
				genericSave: '',
				shaConflict: '',
				deleteConfirm: ''
			}
		},
		preview: {
			eyebrow: '',
			title: '',
			intro: '',
			heroEyebrow: '',
			assetsEyebrow: '',
			assetsTitle: '',
			placeholders: {
				description: '',
				scriptBlock: '',
				styleBlock: '',
				componentBlock: ''
			}
		},
		debug: {
			actorName: '',
			eyebrow: '',
			title: '',
			editorMode: '',
			copyVariant: '',
			visualState: '',
			preview: '',
			visible: '',
			hidden: '',
			edit: '',
			create: '',
			default: '',
			long: '',
			empty: '',
			states: {
				idle: '',
				success: '',
				error: '',
				loading: '',
				disabled: ''
			},
			successState: '',
			errorState: '',
			baseSource: '',
			categories: {
				workbench: '',
				drafts: '',
				archive: ''
			},
			documents: {
				defaultTitle: '',
				longTitle: '',
				defaultDescription: '',
				longDescription: '',
				draftTitle: '',
				draftDescription: '',
				archiveTitle: '',
				archiveDescription: '',
				emptyTitle: '',
				emptyDescription: ''
			}
		},
		errors: {
			accessUnauthorized: '',
			manageRequestFailed: '',
			postListLoadFailed: '',
			postLoadFailed: '',
			sessionInitFailed: '',
			invalidContentType: '',
			missingPayload: '',
			invalidPayloadJson: '',
			invalidPayload: '',
			invalidSlug: '',
			postNotFound: '',
			duplicateSlug: '',
			pathConflict: '',
			shaConflict: '',
			duplicateUploadName: '',
			invalidUploadName: '',
			invalidUploadSize: '',
			invalidUploadType: '',
			invalidCoverPath: '',
			missingCoverPath: '',
			invalidSource: '',
			unresolvedUploadReference: '',
			missingPlatformEnv: '',
			missingManageEnv: '',
			githubRequestFailed: '',
			githubTreeTruncated: '',
			branchConflict: '',
			invalidOrigin: '',
			invalidFetchSite: '',
			invalidCsrf: '',
			csrfRequired: '',
			internalError: ''
		}
	},
	seo: {
		home: {
			description: ''
		},
		about: {
			title: '',
			description: ''
		},
		blog: {
			title: '',
			description: ''
		},
		archive: {
			title: '',
			description: ''
		},
		updates: {
			title: '',
			description: ''
		},
		favorites: {
			title: '',
			description: ''
		},
		manageDebug: {
			title: '',
			description: ''
		},
		tag: {
			title: '',
			description: ''
		},
		error: {
			notFoundTitle: '',
			notFoundDescription: '',
			statusTitle: '',
			statusDescription: ''
		}
	},
	a11y: {
		home: {
			missionBanner: '',
			footerNav: ''
		}
	}
} as const

export type AppMessages = StringLeaves<typeof appMessageSkeleton>
