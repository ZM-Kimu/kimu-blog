type StringLeaves<T> = {
	[K in keyof T]: T[K] extends Record<string, unknown> ? StringLeaves<T[K]> : string
}

export const appMessageSkeleton = {
	meta: {
		localeName: ''
	},
	common: {
		back: '',
		all: '',
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
		readingTime: '',
		readingMinutes: '',
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
		},
		categories: {
			development: '',
			daily: '',
			notes: ''
		}
	},
	nav: {
		home: '',
		blog: '',
		updates: '',
		favorites: '',
		about: '',
		tags: ''
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
		music: {
			emptyTitle: '',
			play: '',
			pause: '',
			previous: '',
			next: '',
			progress: '',
			volume: '',
			mute: '',
			unmute: ''
		},
		missions: {
			development: {
				title: '',
				kicker: '',
				description: '',
				state: ''
			},
			daily: {
				title: '',
				kicker: '',
				description: '',
				state: ''
			},
			notes: {
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
			recentActiveArticles: '',
			recentUpdates: ''
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
			openPost: '',
			categoryEyebrow: '',
			tagsScrollHint: '',
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
			recentTitle: '',
			cards: {
				development: {
					title: ''
				},
				daily: {
					title: ''
				},
				notes: {
					title: ''
				},
				favorites: {
					title: ''
				}
			}
		},
		post: {
			headerEyebrow: '',
			backArchive: '',
			listEyebrow: '',
			listTitle: '',
			descriptionLabel: '',
			seriesLabel: '',
			seriesNewer: '',
			seriesOlder: '',
			asideEyebrow: '',
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
		title: '',
		personalTitle: '',
		githubAriaLabel: '',
		githubFooterLabel: '',
		techStackTitle: '',
		entertainmentTitle: '',
		emailAriaLabel: '',
		mailFooterLabel: '',
		maimaiImageAlt: ''
	},
	updates: {
		title: '',
		description: '',
		summaryAria: '',
		totalLabel: '',
		latestLabel: '',
		feedAria: '',
		openItem: '',
		openLabel: '',
		emptyTitle: '',
		emptyDescription: ''
	},
	favorites: {
		title: '',
		description: '',
		summaryAria: '',
		totalLabel: '',
		filtersLabel: '',
		collectionsAria: '',
		openItem: '',
		emptyTitle: '',
		emptyDescription: ''
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
		nav: {
			ariaLabel: '',
			posts: '',
			updates: '',
			favorites: ''
		},
		records: {
			common: {
				loading: '',
				retry: '',
				save: '',
				delete: '',
				committed: '',
				confirm: {
					create: '',
					edit: '',
					delete: ''
				}
			},
			updates: {
				count: '',
				create: '',
				searchLabel: '',
				searchPlaceholder: '',
				empty: ''
			},
			favorites: {
				count: '',
				create: '',
				searchLabel: '',
				searchPlaceholder: '',
				empty: ''
			},
			fields: {
				title: '',
				id: '',
				date: '',
				added: '',
				project: '',
				progress: '',
				summary: '',
				description: '',
				tags: '',
				href: '',
				sourceLabel: ''
			},
			placeholders: {
				tags: '',
				href: '',
				hrefOptional: '',
				favoriteTags: ''
			}
		},
		groups: {
			none: '',
			createProject: '',
			createSeries: '',
			rename: '',
			renameSave: '',
			renameCancel: '',
			confirmRename: ''
		},
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
			errorTitle: '',
			search: '',
			searchPlaceholder: '',
			articleCount: '',
			newPost: '',
			retry: '',
			noMatchesTitle: '',
			noMatchesDescription: '',
			draft: '',
			featured: ''
		},
		editor: {
			createTitle: '',
			editTitle: '',
			loadingTitle: '',
			errorTitle: '',
			createSubmit: '',
			saveChanges: '',
			submitting: '',
			delete: '',
			retry: '',
			source: '',
			tabs: {
				ariaLabel: '',
				information: '',
				content: ''
			},
			previewVisibility: {
				show: '',
				hide: ''
			},
			confirmSubmit: {
				create: '',
				update: ''
			},
			slugStatus: {
				checking: '',
				available: '',
				invalid: '',
				duplicate: '',
				unavailable: ''
			},
			fields: {
				title: '',
				slug: '',
				description: '',
				date: '',
				updated: '',
				category: '',
				author: '',
				series: '',
				readingMinutes: '',
				format: '',
				tags: '',
				cover: ''
			},
			placeholders: {
				readingMinutes: '',
				tags: '',
				cover: ''
			},
			toggles: {
				draft: '',
				featured: ''
			},
			uploads: {
				title: '',
				pickFiles: '',
				dropTitle: '',
				dropDescription: '',
				setCover: '',
				insertBody: '',
				remove: ''
			},
			statusCommitted: '',
			errors: {
				genericSave: '',
				shaConflict: '',
				deleteConfirm: ''
			}
		},
		preview: {
			empty: '',
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
			recordListLoadFailed: '',
			recordLoadFailed: '',
			recordNotFound: '',
			duplicateRecordId: '',
			invalidRecord: '',
			invalidRecordKind: '',
			invalidRecordId: '',
			invalidGroup: '',
			invalidGroupId: '',
			invalidGroupKind: '',
			invalidGroupName: '',
			groupNotFound: '',
			duplicateGroupName: '',
			duplicateGroupId: '',
			missingGroupName: '',
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
			musicPlayer: '',
			footerNav: ''
		}
	}
} as const

export type AppMessages = StringLeaves<typeof appMessageSkeleton>
