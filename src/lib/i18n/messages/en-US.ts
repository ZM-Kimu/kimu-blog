import type { AppMessages } from './schema'

export const enUSMessages = {
	meta: {
		localeName: 'English'
	},
	common: {
		back: 'Back',
		home: 'Home',
		close: 'Close',
		info: 'Info',
		featured: 'Featured',
		published: 'Published',
		updated: 'Updated',
		record: 'Record',
		recordsLabel: 'Records',
		status: 'Status',
		uncategorized: 'Uncategorized',
		publishedAt: 'Published {date}',
		updatedAt: 'Updated {date}',
		author: 'Author',
		category: 'Category',
		slug: 'Slug',
		tagCount: '{count} tags',
		renderMode: 'Render mode',
		prerender: 'Prerender',
		records: '{count} records',
		totalRecords: '{count} total records',
		visibleRecords: '{count} visible',
		logs: '{count} logs',
		pendingSlug: 'pending-slug',
		noTagsYet: 'No tags yet',
		untitledDraft: 'Untitled draft',
		summaryPlaceholder: 'This is where the summary and opening copy will appear.',
		states: {
			live: 'Live',
			standby: 'Standby',
			comingSoon: 'Coming Soon'
		}
	},
	nav: {
		home: 'Home',
		blog: 'Missions',
		updates: 'Updates',
		favorites: 'Favorites',
		about: 'About'
	},
	shell: {
		brand: {
			tagline: 'Command Center'
		},
		aria: {
			primaryNav: 'Primary navigation',
			quickNav: 'Quick access'
		},
		portraitHint: {
			desktop: 'You are viewing the site in portrait. A 16:9 landscape window works better here.',
			mobile: 'You are in portrait mode. Switch to landscape for a better view.'
		},
		status: {
			current: 'Current',
			mode: 'Mode',
			modeValue: 'LIVE',
			stack: 'Stack',
			stackValue: 'SvelteKit',
			deploy: 'Deploy',
			deployValue: 'Pages'
		},
		section: {
			archive: 'Archive',
			dossier: 'Dossier',
			interface: 'Interface'
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
			main: 'Main',
			subpage: 'Subpage'
		},
		action: {
			enterContent: 'Enter content',
			badge: 'Main',
			enterBlog: 'Enter missions'
		},
		banner: {
			featured: 'Featured',
			missionAria: 'Mission banner',
			footerAria: 'Primary destinations',
			heightGuardEyebrow: 'Viewport Guard',
			heightGuardTitle: 'The current window is too short',
			heightGuardDescription:
				'The home shell needs at least 500px of visible height. Resize the browser window or move to a content page first.',
			heightGuardPrimary: 'Enter content',
			heightGuardSecondary: 'View profile'
		},
		profile: {
			info: 'Info'
		},
		missions: {
			engineering: {
				title: 'Engineering',
				kicker: 'Mission 01',
				description: 'SvelteKit, Cloudflare, tooling, architecture notes, and implementation logs.',
				state: 'Live'
			},
			designLog: {
				title: 'Design Log',
				kicker: 'Mission 02',
				description:
					'Interaction studies, layout thinking, typography choices, and style system records.',
				state: 'Standby'
			},
			fieldNotes: {
				title: 'Field Notes',
				kicker: 'Mission 03',
				description: 'Short-form observations, references, experiments, and personal notes.',
				state: 'Standby'
			},
			favorites: {
				title: 'Favorites',
				kicker: 'Mission 04',
				description: 'Curated links, saved references, and collected inspirations.',
				state: 'Coming Soon'
			}
		}
	},
	topbar: {
		aria: {
			main: 'Home top bar main style',
			subpage: 'Home top bar subpage style',
			resources: 'Home resources',
			actions: 'Home top bar actions',
			back: 'Go back'
		},
		actions: {
			language: 'Toggle language',
			collapse: 'Collapse top bar',
			settings: 'Open settings',
			home: 'Return home',
			expand: 'Expand top bar'
		},
		metrics: {
			articles: 'Site articles',
			todos: 'Open todos',
			recentActivity: 'Posts added or updated in the last 30 days'
		},
		settings: {
			title: 'Site Settings',
			close: 'Close settings',
			cursor: 'Cursor Style',
			cursorDescription: 'Switch between the in-world pointer and the browser default cursor.',
			custom: 'Custom',
			system: 'System',
			backgroundAnimation: 'Background Animation',
			backgroundAnimationDescription:
				'Enable the Spine-powered animated background enhancement layer for home.',
			backgroundAnimationOn: 'On',
			backgroundAnimationOff: 'Off',
			backgroundAnimationDisabled:
				'Automatically disabled on portrait document-flow layout or reduced motion.',
			backgroundAnimationFailed: 'Asset loading failed, so the default background is being used.',
			manage: 'Manage Workbench',
			manageDescription:
				'Open the content maintenance panel for post lists, editor states, and repository writes.',
			manageAction: 'Open'
		}
	},
	blog: {
		archive: {
			short: 'Archive',
			introEyebrow: 'Archive',
			introTitle: 'Full Archive',
			introDescription:
				'The mission page handles entry and selection; this screen is for high-speed browsing across every record.',
			backToBlog: 'Back to mission page',
			categoryEyebrow: 'Category',
			emptyDate: 'No Records',
			emptyTitle: 'Waiting for content',
			emptyDescription: 'This category is reserved, but there are no published posts in it yet.',
			yearEyebrow: 'Year Index',
			yearTitle: 'Browse by year'
		},
		mission: {
			introEyebrow: 'Mission Page',
			introTitle: 'Content mission page',
			introDescription:
				'This screen handles primary category selection instead of acting as a traditional blog feed. Top-level cards represent the main content divisions, while chronological browsing lives in the archive.',
			archiveCta: 'Open full archive',
			homeCta: 'Back to home',
			boardEyebrow: 'Primary Categories',
			boardTitle: 'Mission Board',
			recentEyebrow: 'Recent Output',
			recentTitle: 'Latest Records'
		},
		post: {
			heroEyebrow: 'Dossier / Article Record',
			backArchive: 'Back to archive',
			statusFeatured: 'Featured',
			statusPublished: 'Published',
			metadataEyebrow: 'Metadata',
			metadataTitle: 'Article metadata',
			tagsEyebrow: 'Tag Matrix',
			tagsTitle: 'Tag access',
			relatedEyebrow: 'Related Output',
			relatedTitle: 'Related records',
			relatedEmptyTitle: 'Waiting for more records',
			relatedEmptyDescription:
				'Related recommendations will appear here once more articles are available.'
		},
		tag: {
			introEyebrow: 'Tag Filter',
			introDescription:
				'There are currently {count} posts grouped under this tag, so it can serve as a secondary filter entry.',
			backArchive: 'Back to archive'
		}
	},
	about: {
		heroEyebrow: 'Profile Dossier',
		backHome: 'Back to home',
		title: 'About this site',
		description:
			'Kimu Blog is designed as a game-like personal command center: content stays central, while the interface structure borrows from mission board and dossier UI patterns.',
		systemsEyebrow: 'Loaded Systems',
		systemsTitle: 'Current capabilities',
		nextEyebrow: 'Next Missions',
		nextTitle: 'Next steps',
		items: {
			cloudflarePages: 'Cloudflare Pages build and delivery',
			mdsvex: 'mdsvex content integration',
			schemaValidation: 'frontmatter schema validation',
			entries: '`entries()` + prerender detail generation',
			gameUi: 'game UI styled page framework',
			replacePlaceholders: 'replace placeholder assets',
			profileData: 'add dynamic data and richer profile fields',
			realContent: 'ship real archive / favorites / updates content',
			searchCommentsAnalytics: 'add search, comments, and analytics'
		}
	},
	updates: {
		eyebrow: 'Live Log',
		title: 'Updates module',
		description:
			'This page will hold site updates, in-progress work, recent state changes, and short status notes. It stays as a placeholder for now.'
	},
	favorites: {
		eyebrow: 'Curated Vault',
		title: 'Favorites module',
		description:
			'This page will hold saved articles, inspiration references, link lists, and archived resources. It stays as a placeholder for now.'
	},
	error: {
		title: 'Error',
		eyebrowNotFound: 'Route Lost',
		eyebrowFault: 'Unhandled Fault',
		headlineNotFound: 'Page not found~ (´・ω・`)',
		headlineFault: 'System fault detected (´；ω；`)',
		headlineInterrupted: 'The system signal was interrupted before the page could finish loading.',
		detailNotFound: 'The requested page does not exist.',
		detailUnknown: 'An unknown error occurred.',
		detailFallback: 'An error occurred and the fallback page has taken over.',
		visualAltFault: 'Arona embarrassed illustration for the 500 error presentation.',
		visualAltGeneric: 'Arona popup illustration for the generic error presentation.',
		fallbackIllustration: 'Fallback illustration'
	},
	manage: {
		shell: {
			eyebrow: 'Private Content Workbench',
			title: 'Manage / {repo}',
			description: 'Connected as {actor}. Writing into {owner}/{repo} on {branch}.',
			navAria: 'Manage navigation',
			navContent: 'Content',
			navPosts: 'Posts',
			backPublic: 'Back to public site'
		},
		list: {
			eyebrow: 'Repository Records',
			title: 'Post list',
			loadingTitle: 'Loading post list',
			loadingDescription: 'The manage shell is ready. The repository index is syncing now.',
			errorTitle: 'Failed to load the post list',
			search: 'Search',
			searchPlaceholder: 'title / slug / category',
			newPost: 'New post',
			retry: 'Retry',
			noMatchesTitle: 'No matches',
			noMatchesDescription: 'There are no posts under the current filters.',
			draft: 'draft',
			featured: 'featured'
		},
		editor: {
			eyebrow: 'Editor',
			createTitle: 'Create post',
			editTitle: 'Edit {slug}',
			loadingTitle: 'Loading post content',
			loadingDescription: 'The editor shell is ready. The document is syncing now.',
			errorTitle: 'Failed to load the post content',
			createSubmit: 'Create post',
			saveChanges: 'Save changes',
			submitting: 'Submitting…',
			delete: 'Delete',
			retry: 'Retry',
			source: 'Source',
			fields: {
				title: 'Title',
				description: 'Description',
				date: 'Published date',
				updated: 'Updated date',
				category: 'Category',
				author: 'Author',
				series: 'Series',
				readingTime: 'Reading Time',
				canonical: 'Canonical',
				format: 'Format',
				tags: 'Tags',
				cover: 'Cover'
			},
			placeholders: {
				category: 'Engineering / Notes',
				readingTime: '6 min',
				canonical: 'https://...',
				tags: 'svelte, cloudflare, devlog',
				cover: '/images/... or upload://file.png'
			},
			toggles: {
				draft: 'Draft',
				featured: 'Featured',
				toc: 'TOC'
			},
			uploads: {
				eyebrow: 'Uploads',
				title: 'Images and placeholders',
				pickFiles: 'Pick images',
				setCover: 'Use as cover',
				insertBody: 'Insert into body',
				remove: 'Remove',
				empty:
					'Uploaded images generate `upload://filename` placeholders and are swapped live in the preview panel.'
			},
			statusCommitted: 'Committed {sha}; the latest content has been synced to the repository.',
			errors: {
				genericSave: 'Saving failed. Please try again shortly.',
				shaConflict:
					'The repository copy has changed. Refresh the page before continuing your edits.',
				deleteConfirm: 'Delete post {slug}? This will commit directly to the repository.'
			}
		},
		preview: {
			eyebrow: 'Live Preview',
			title: 'Body preview',
			intro:
				'Markdown / GFM / images render with article styles instantly; mdsvex components and imports are shown as placeholders.',
			heroEyebrow: 'Article Record',
			assetsEyebrow: 'Asset Index',
			assetsTitle: 'Resolved assets',
			placeholders: {
				description: 'The preview panel does not execute this mdsvex / Svelte logic.',
				scriptBlock: '<script> block',
				styleBlock: '<style> block',
				componentBlock: '{name} component'
			}
		},
		debug: {
			actorName: 'Debug Operator',
			eyebrow: 'Debug Sandbox',
			title: 'Manage style debugging',
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
			successState: 'Local success state active. Nothing will be written to the repository.',
			errorState: 'Local error state active for checking editor feedback styles.',
			baseSource: `## Current debug targets

- Check the header density of the manage shell
- Check the column balance between editor and preview
- Check how long copy, empty states, error states, and loading states behave visually

![debug-cover](/images/og-default.svg)
`,
			categories: {
				workbench: 'Workbench',
				drafts: 'Drafts',
				archive: 'Archive'
			},
			documents: {
				defaultTitle: 'Manage debug sample',
				longTitle:
					'An intentionally long title sample for checking multi-line behavior inside the manage editor layout',
				defaultDescription: 'A mock draft used for local style and interaction debugging.',
				longDescription:
					'This longer summary is used to observe wrapping, density, and rhythm across editor fields, preview headers, and the manage sandbox under long-copy conditions.',
				draftTitle: 'Draft sample',
				draftDescription: 'Draft state, regular length, not featured.',
				archiveTitle: 'Archive sample',
				archiveDescription: 'Used to inspect density across different category chips.',
				emptyTitle: 'Empty-content sample',
				emptyDescription: 'Used to inspect how empty-content documents appear in the list.'
			}
		},
		errors: {
			accessUnauthorized: 'Cloudflare Access verification failed.',
			manageRequestFailed: 'Manage request failed.',
			postListLoadFailed: 'Failed to load the post list.',
			postLoadFailed: 'Failed to load the post content.',
			sessionInitFailed: 'Failed to initialize the manage session.',
			invalidContentType: 'The request must use multipart/form-data.',
			missingPayload: 'The payload JSON field is missing.',
			invalidPayloadJson: 'The payload must be valid JSON.',
			invalidPayload: 'Payload validation failed.',
			invalidSlug: 'The slug is invalid.',
			postNotFound: 'The post could not be found.',
			duplicateSlug: 'The slug already exists.',
			pathConflict: 'The target path already exists.',
			shaConflict: 'expectedSha does not match the current file.',
			duplicateUploadName: 'Duplicate uploaded file names were detected.',
			invalidUploadName: 'The image file name is invalid.',
			invalidUploadSize: 'The uploaded image exceeds the size limit.',
			invalidUploadType: 'The uploaded image type is not supported.',
			invalidCoverPath: 'Cover must be an absolute in-site path.',
			missingCoverPath: 'The cover path does not point to an existing asset.',
			invalidSource: 'The body source is invalid.',
			unresolvedUploadReference: 'There is an unresolved upload:// reference.',
			missingPlatformEnv: 'The current runtime is missing Cloudflare env bindings.',
			missingManageEnv: 'Manage environment variables are missing.',
			githubRequestFailed: 'GitHub request failed.',
			githubTreeTruncated: 'The GitHub tree response was truncated.',
			branchConflict: 'The target branch write conflicted.',
			invalidOrigin: 'Origin verification failed.',
			invalidFetchSite: 'Sec-Fetch-Site verification failed.',
			invalidCsrf: 'CSRF verification failed.',
			csrfRequired: 'Browser origin verification or a service token is required.',
			internalError: 'An unknown internal error occurred.'
		}
	},
	seo: {
		home: {
			description:
				'The main interface of Kimu Blog, organized like a game home screen for personal identity, updates, and content entry points.'
		},
		about: {
			title: 'About',
			description: 'The current scaffold and development direction of Kimu Blog.'
		},
		blog: {
			title: 'Mission Page',
			description:
				'Browse Kimu Blog categories and recent records through a mission-board style interface.'
		},
		archive: {
			title: 'Full Archive',
			description: 'Browse the full Kimu Blog record set by category and year.'
		},
		updates: {
			title: 'Updates',
			description: 'Placeholder page for the updates module of Kimu Blog.'
		},
		favorites: {
			title: 'Favorites',
			description: 'Placeholder page for the favorites module of Kimu Blog.'
		},
		manageDebug: {
			title: 'Manage Debug',
			description:
				'Single-page sandbox for locally debugging manage visuals, layout density, and interaction states.'
		},
		tag: {
			title: 'Tag: {tag}',
			description: 'Browse posts filed under the {tag} tag.'
		},
		error: {
			notFoundTitle: '404 / Not Found',
			notFoundDescription: 'The requested path does not exist.',
			statusTitle: 'Error {status}',
			statusDescription: 'An error occurred and the fallback page has taken over.'
		}
	},
	a11y: {
		home: {
			missionBanner: 'Mission banner',
			footerNav: 'Primary destinations'
		}
	}
} satisfies AppMessages
