export type MotionEnvironment = {
	portrait: boolean
	reducedMotion: boolean
}

export type MotionTokens = ReturnType<typeof getMotionTokens>

const cssEasing = {
	standard: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
	topbarProfile: 'cubic-bezier(0.28, 0.8, 0.32, 1)'
} as const

const gsapEasing = {
	power1Out: 'power1.out',
	power2Out: 'power2.out',
	power2In: 'power2.in',
	power3InOut: 'power3.inOut',
	expoInOut: 'expo.inOut'
} as const

function formatCssVar(name: string, value: number | string) {
	return `--${name}: ${value};`
}

function ms(value: number) {
	return `${value}ms`
}

function px(value: number) {
	return `${value}px`
}

function rem(value: number) {
	return `${value}rem`
}

function pct(value: number) {
	return `${value}%`
}

export function msToSeconds(value: number) {
	return value / 1000
}

export function getMotionTokens({ portrait, reducedMotion }: MotionEnvironment) {
	const standardEase = cssEasing.standard
	const shared = {
		easingStandard: standardEase,
		easeStandard: `220ms ${standardEase}`,
		reducedInstantDurationMs: 1
	}

	const press = {
		inDurationMs: 250,
		outDurationMs: 220,
		activeScale: 0.96,
		activeTranslateYPx: 1
	}

	const boot = {
		holdDurationMs: reducedMotion ? 120 : 1100,
		entryDurationMs: reducedMotion ? 160 : 620,
		entryOffsetYPx: 22,
		entryBlurPx: 10,
		shellOffsetYPx: 18,
		topbarOffsetYPx: -18,
		topbarDelayMs: reducedMotion ? 0 : 40,
		primaryDelayMs: reducedMotion ? 0 : 120,
		missionDelayMs: reducedMotion ? 0 : 170,
		footerDelayMs: reducedMotion ? 0 : 210,
		overlayExitDurationMs: reducedMotion ? 120 : 260,
		overlayExitScale: 1.015,
		overlayExitBlurPx: 10,
		stackRevealDurationMs: reducedMotion ? 120 : 140,
		stackRevealBlurPx: 10,
		labelRevealDurationMs: reducedMotion ? 120 : 140,
		labelRevealBlurPx: 8,
		haloSwapDurationMs: reducedMotion ? 1 : 40,
		iconFlipDegreesPerSecond: 180,
		iconHaloPhaseOffsetMs: 500,
		iconHaloCycleDurationMs: 1000,
		labelWaveDurationMs: reducedMotion ? 1 : 900,
		labelWaveStepDelayMs: reducedMotion ? 0 : 60,
		labelWaveLiftRem: 0.62,
		labelWaveSettleRem: 0.08
	}

	const route = {
		exitDurationMs: reducedMotion ? 50 : 100,
		entryDurationMs: reducedMotion ? 80 : 160,
		bridgeDurationMs: reducedMotion ? 0 : 180,
		desktopHomeEnterDurationMs: reducedMotion ? 1 : 830,
		desktopSubpageEnterDurationMs: reducedMotion ? 1 : 740,
		desktopHomeEnterDelayPrimaryMs: reducedMotion ? 0 : 120,
		desktopHomeEnterDelayMissionMs: reducedMotion ? 0 : 170,
		desktopHomeEnterDelayFooterMs: reducedMotion ? 0 : 210,
		desktopHomeEnterDurationStepMs: reducedMotion ? 1 : 620,
		desktopHomeEnterOffsetXPx: 24,
		desktopHomeEnterOffsetYPx: 22,
		desktopHomeEnterBlurPx: 10,
		desktopHomeExitDurationMs: reducedMotion ? 1 : 120,
		desktopHomeExitOffsetXPx: 18,
		desktopHomeExitOffsetYPx: 18,
		desktopSubpageEnterDurationStepMs: reducedMotion ? 1 : 620,
		desktopSubpageEnterDelayMs: reducedMotion ? 0 : 120,
		desktopSubpageEnterOffsetYPx: 22,
		desktopSubpageEnterBlurPx: 10,
		portraitPageEnterDurationMs: reducedMotion ? 1 : 320,
		portraitPageEnterDelayMs: 0,
		portraitPageEnterOffsetYPx: 18,
		portraitPageEnterBlurPx: 0
	}

	const background = {
		sceneCrossfadeDurationMs: reducedMotion ? 0 : portrait ? 0 : 180,
		spineOverlayFadeDurationMs: reducedMotion ? 1 : 260
	}

	const notice = {
		enterDurationMs: reducedMotion ? 1 : 260,
		exitDurationMs: reducedMotion ? 1 : 180,
		visibleDurationMs: reducedMotion ? 1400 : 3200,
		offsetYPx: 14
	}

	const error = {
		enterEase: standardEase,
		enterOffsetYPx: 22,
		visualDurationMs: reducedMotion ? 1 : 620,
		visualDelayMs: reducedMotion ? 0 : 80,
		eyebrowDurationMs: reducedMotion ? 1 : 520,
		eyebrowDelayMs: reducedMotion ? 0 : 150,
		headlineDurationMs: reducedMotion ? 1 : 620,
		headlineDelayMs: reducedMotion ? 0 : 210,
		messageDurationMs: reducedMotion ? 1 : 520,
		messageDelayMs: reducedMotion ? 0 : 280
	}

	const about = {
		enterDurationMs: reducedMotion ? 1 : 720,
		exitDurationMs: reducedMotion ? 1 : 250,
		cardEnterDurationMs: reducedMotion ? 1 : 640,
		cardExitDurationMs: reducedMotion ? 1 : 320,
		cardExitDelayMs: reducedMotion ? 0 : 60,
		cardEnterScaleX: 0.055,
		cardEnterScaleY: 0.965,
		cardExitScaleX: 0,
		cardExitScaleY: 0.975,
		cardEnterClipInlinePercent: 94.5,
		cardExitClipInlinePercent: 100,
		cardEnterBlurPx: 8,
		cardExitBlurPx: 6,
		contentEnterDurationMs: reducedMotion ? 1 : 360,
		contentEnterDelayMs: reducedMotion ? 0 : 190,
		contentExitDurationMs: reducedMotion ? 1 : 180,
		footerEnterDurationMs: reducedMotion ? 1 : 420,
		footerEnterDelayMs: reducedMotion ? 0 : 250,
		footerEnterStaggerMs: reducedMotion ? 0 : 90,
		footerExitDurationMs: reducedMotion ? 1 : 220,
		footerExitStaggerMs: reducedMotion ? 0 : 42,
		footerEnterOffsetYPx: 18,
		footerExitOffsetYPx: 12
	}

	const homeAmbient = {
		missionStepIntervalMs: 5000,
		missionStepDurationMs: reducedMotion ? 1 : 520,
		musicVolumeDurationMs: reducedMotion ? 1 : 220
	}

	const blog = {
		missionRailEnterDurationMs: reducedMotion ? 1 : 480,
		missionRailEnterOffsetXPx: 28,
		missionCardEnterDurationMs: reducedMotion ? 1 : 460,
		missionCardEnterOffsetYPx: 18,
		missionCardEnterStaggerMs: reducedMotion ? 0 : 70,
		missionExitDurationMs: reducedMotion ? 1 : 140,
		missionExitOffsetXPx: 20,
		missionExitStaggerMs: reducedMotion ? 0 : 36,
		missionRailExitDelayMs: reducedMotion ? 0 : 108,
		missionExitTotalDurationMs: reducedMotion ? 1 : 158,
		postReaderSwapDurationMs: reducedMotion ? 1 : 240,
		postReaderSwapOffsetYPx: 14,
		postAsideSwapDurationMs: reducedMotion ? 1 : 180,
		postAsideSwapOffsetYPx: 10
	}

	const topbar = {
		stageDurationMs: 220,
		stageCollapseDelayMs: 90,
		stageCollapseOffsetYRem: -1.2,
		reopenOpacityDurationMs: 180,
		surfaceDurationMs: 180,
		profileTransitionEasing: cssEasing.topbarProfile,
		profileCollapseOffsetXRem: -2,
		profileCollapseScale: 0.97,
		asideCollapseOffsetYRem: -0.18,
		asideCollapseOpacity: 0.94,
		toolHoverLiftYPx: -1,
		settingsSwitchDurationMs: 220,
		settingsChoiceColorDurationMs: 180,
		reopenTransitionDurationMs: reducedMotion ? 120 : 220,
		reopenOffsetYPx: -12,
		reopenBlurPx: 10,
		reopenScaleFrom: 0.9,
		settingsScrimEnterDurationMs: reducedMotion ? 1 : 180,
		settingsScrimExitDurationMs: reducedMotion ? 1 : 150,
		settingsDialogEnterDurationMs: reducedMotion ? 1 : 260,
		settingsDialogEnterOffsetYPx: 18,
		settingsDialogEnterBlurPx: 12,
		settingsDialogEnterScaleFrom: 0.985,
		settingsDialogExitDurationMs: reducedMotion ? 1 : 180,
		settingsDialogExitOffsetYPx: 10,
		settingsDialogExitBlurPx: 8,
		settingsDialogExitScaleFrom: 0.985,
		richDurationMs: 580,
		stripRevealDurationMs: 240,
		portraitDurationMs: 180,
		reducedDurationMs: 120,
		stripDropOffsetPx: -20,
		stripRetreatOffsetPx: -16,
		titleRevealAtMs: 340,
		profileRevealAtMs: 360,
		glyphSwitchAtMs: 319,
		toolIconSwitchAtMs: 197.2,
		textExitDurationMs: 145,
		chipSkinFadeDurationMs: 120,
		resourceDividerRevealDurationMs: 80,
		toolIconFadeOutDurationMs: 100,
		toolIconFadeInDurationMs: 120,
		toolIconFadeInOffsetMs: 20,
		flipStaggerMs: 28,
		backTitleRevealDurationMs: 180,
		titleGhostExitDurationMs: 160,
		glyphFadeDurationMs: 120,
		morphTextRevealAtMs: 360,
		morphTextRevealDurationMs: 180,
		profileChipRevealDurationMs: 180,
		profileContentRevealDurationMs: 160,
		profileContentRevealOffsetMs: 0,
		profileContentStaggerMs: 0,
		chipSkinHandoffOffsetMs: 40,
		chipSkinHandoffTailBufferMs: 180,
		resourceDividerRevealOffsetMs: 30,
		morphHideLeadMs: 10,
		simpleTransitionOffsetYPx: 4,
		titleGhostOffsetXPx: 10,
		morphGlyphHiddenScale: 0.76,
		gsapEasePower1Out: gsapEasing.power1Out,
		gsapEasePower2Out: gsapEasing.power2Out,
		gsapEasePower2In: gsapEasing.power2In,
		gsapEasePower3InOut: gsapEasing.power3InOut,
		gsapEaseExpoInOut: gsapEasing.expoInOut
	}

	const topbarVisual = {
		profileChipGapRem: 0.82,
		profileAvatarShiftX: '-5%',
		profileCopyGapRem: 0.62
	}

	return {
		portrait,
		reducedMotion,
		shared,
		press,
		boot,
		route,
		background,
		notice,
		error,
		about,
		homeAmbient,
		blog,
		topbar,
		topbarVisual
	}
}

function createCssVars(values: Array<[string, number | string]>) {
	return values.map(([name, value]) => formatCssVar(name, value)).join(' ')
}

export function createGlobalMotionCssVars(tokens: MotionTokens) {
	return createCssVars([
		['motion-shared-easing-standard', tokens.shared.easingStandard],
		['motion-shared-ease-standard', tokens.shared.easeStandard],
		['motion-shared-reduced-instant-duration', ms(tokens.shared.reducedInstantDurationMs)],
		['motion-press-in-duration', ms(tokens.press.inDurationMs)],
		['motion-press-out-duration', ms(tokens.press.outDurationMs)],
		['motion-press-active-scale', tokens.press.activeScale],
		['motion-press-active-translate-y', px(tokens.press.activeTranslateYPx)],
		['motion-boot-entry-duration', ms(tokens.boot.entryDurationMs)],
		['motion-boot-entry-offset-y', px(tokens.boot.entryOffsetYPx)],
		['motion-boot-entry-blur', px(tokens.boot.entryBlurPx)],
		['motion-boot-shell-offset-y', px(tokens.boot.shellOffsetYPx)],
		['motion-boot-topbar-offset-y', px(tokens.boot.topbarOffsetYPx)],
		['motion-boot-topbar-delay', ms(tokens.boot.topbarDelayMs)],
		['motion-boot-primary-delay', ms(tokens.boot.primaryDelayMs)],
		['motion-boot-mission-delay', ms(tokens.boot.missionDelayMs)],
		['motion-boot-footer-delay', ms(tokens.boot.footerDelayMs)],
		['motion-boot-overlay-exit-duration', ms(tokens.boot.overlayExitDurationMs)],
		['motion-boot-overlay-exit-scale', tokens.boot.overlayExitScale],
		['motion-boot-overlay-exit-blur', px(tokens.boot.overlayExitBlurPx)],
		['motion-boot-overlay-stack-reveal-duration', ms(tokens.boot.stackRevealDurationMs)],
		['motion-boot-overlay-stack-hidden-blur', px(tokens.boot.stackRevealBlurPx)],
		['motion-boot-overlay-label-reveal-duration', ms(tokens.boot.labelRevealDurationMs)],
		['motion-boot-overlay-label-hidden-blur', px(tokens.boot.labelRevealBlurPx)],
		['motion-boot-overlay-halo-swap-duration', ms(tokens.boot.haloSwapDurationMs)],
		['motion-boot-overlay-icon-flip-degrees-per-second', tokens.boot.iconFlipDegreesPerSecond],
		['motion-boot-overlay-icon-halo-phase-offset', ms(tokens.boot.iconHaloPhaseOffsetMs)],
		['motion-boot-overlay-icon-cycle-duration', ms(tokens.boot.iconHaloCycleDurationMs)],
		['motion-boot-overlay-wave-duration', ms(tokens.boot.labelWaveDurationMs)],
		['motion-boot-overlay-wave-step-delay', ms(tokens.boot.labelWaveStepDelayMs)],
		['motion-boot-overlay-wave-lift', rem(tokens.boot.labelWaveLiftRem)],
		['motion-boot-overlay-wave-settle', rem(tokens.boot.labelWaveSettleRem)],
		['motion-route-page-exit-duration', ms(tokens.route.exitDurationMs)],
		['motion-route-page-entry-duration', ms(tokens.route.entryDurationMs)],
		['motion-route-bridge-duration', ms(tokens.route.bridgeDurationMs)],
		['motion-route-home-enter-duration', ms(tokens.route.desktopHomeEnterDurationStepMs)],
		['motion-route-home-enter-delay-primary', ms(tokens.route.desktopHomeEnterDelayPrimaryMs)],
		['motion-route-home-enter-delay-mission', ms(tokens.route.desktopHomeEnterDelayMissionMs)],
		['motion-route-home-enter-delay-footer', ms(tokens.route.desktopHomeEnterDelayFooterMs)],
		['motion-route-home-enter-offset-x', px(tokens.route.desktopHomeEnterOffsetXPx)],
		['motion-route-home-enter-offset-y', px(tokens.route.desktopHomeEnterOffsetYPx)],
		['motion-route-home-enter-blur', px(tokens.route.desktopHomeEnterBlurPx)],
		['motion-route-home-exit-duration', ms(tokens.route.desktopHomeExitDurationMs)],
		['motion-route-home-exit-offset-x', px(tokens.route.desktopHomeExitOffsetXPx)],
		['motion-route-home-exit-offset-y', px(tokens.route.desktopHomeExitOffsetYPx)],
		['motion-route-subpage-enter-duration', ms(tokens.route.desktopSubpageEnterDurationStepMs)],
		['motion-route-subpage-enter-delay', ms(tokens.route.desktopSubpageEnterDelayMs)],
		['motion-route-subpage-enter-offset-y', px(tokens.route.desktopSubpageEnterOffsetYPx)],
		['motion-route-subpage-enter-blur', px(tokens.route.desktopSubpageEnterBlurPx)],
		['motion-route-portrait-enter-duration', ms(tokens.route.portraitPageEnterDurationMs)],
		['motion-route-portrait-enter-delay', ms(tokens.route.portraitPageEnterDelayMs)],
		['motion-route-portrait-enter-offset-y', px(tokens.route.portraitPageEnterOffsetYPx)],
		['motion-route-portrait-enter-blur', px(tokens.route.portraitPageEnterBlurPx)],
		['motion-bg-bridge-duration', ms(tokens.background.sceneCrossfadeDurationMs)],
		['motion-bg-spine-fade-duration', ms(tokens.background.spineOverlayFadeDurationMs)],
		['motion-notice-enter-duration', ms(tokens.notice.enterDurationMs)],
		['motion-notice-exit-duration', ms(tokens.notice.exitDurationMs)],
		['motion-notice-visible-duration', ms(tokens.notice.visibleDurationMs)],
		['motion-notice-offset-y', px(tokens.notice.offsetYPx)],
		['motion-error-enter-ease', tokens.error.enterEase],
		['motion-error-enter-offset-y', px(tokens.error.enterOffsetYPx)],
		['motion-error-visual-duration', ms(tokens.error.visualDurationMs)],
		['motion-error-visual-delay', ms(tokens.error.visualDelayMs)],
		['motion-error-eyebrow-duration', ms(tokens.error.eyebrowDurationMs)],
		['motion-error-eyebrow-delay', ms(tokens.error.eyebrowDelayMs)],
		['motion-error-headline-duration', ms(tokens.error.headlineDurationMs)],
		['motion-error-headline-delay', ms(tokens.error.headlineDelayMs)],
		['motion-error-message-duration', ms(tokens.error.messageDurationMs)],
		['motion-error-message-delay', ms(tokens.error.messageDelayMs)],
		['motion-about-enter-duration', ms(tokens.about.enterDurationMs)],
		['motion-about-exit-duration', ms(tokens.about.exitDurationMs)],
		['motion-about-card-enter-duration', ms(tokens.about.cardEnterDurationMs)],
		['motion-about-card-exit-duration', ms(tokens.about.cardExitDurationMs)],
		['motion-about-card-exit-delay', ms(tokens.about.cardExitDelayMs)],
		['motion-about-card-enter-scale-x', tokens.about.cardEnterScaleX],
		['motion-about-card-enter-scale-y', tokens.about.cardEnterScaleY],
		['motion-about-card-exit-scale-x', tokens.about.cardExitScaleX],
		['motion-about-card-exit-scale-y', tokens.about.cardExitScaleY],
		['motion-about-card-enter-clip-inline', pct(tokens.about.cardEnterClipInlinePercent)],
		['motion-about-card-exit-clip-inline', pct(tokens.about.cardExitClipInlinePercent)],
		['motion-about-card-enter-blur', px(tokens.about.cardEnterBlurPx)],
		['motion-about-card-exit-blur', px(tokens.about.cardExitBlurPx)],
		['motion-about-content-enter-duration', ms(tokens.about.contentEnterDurationMs)],
		['motion-about-content-enter-delay', ms(tokens.about.contentEnterDelayMs)],
		['motion-about-content-exit-duration', ms(tokens.about.contentExitDurationMs)],
		['motion-about-footer-enter-duration', ms(tokens.about.footerEnterDurationMs)],
		['motion-about-footer-enter-delay', ms(tokens.about.footerEnterDelayMs)],
		['motion-about-footer-enter-stagger', ms(tokens.about.footerEnterStaggerMs)],
		['motion-about-footer-exit-duration', ms(tokens.about.footerExitDurationMs)],
		['motion-about-footer-exit-stagger', ms(tokens.about.footerExitStaggerMs)],
		['motion-about-footer-enter-offset-y', px(tokens.about.footerEnterOffsetYPx)],
		['motion-about-footer-exit-offset-y', px(tokens.about.footerExitOffsetYPx)],
		['motion-home-mission-step-interval', ms(tokens.homeAmbient.missionStepIntervalMs)],
		['motion-home-mission-step-duration', ms(tokens.homeAmbient.missionStepDurationMs)],
		['motion-home-music-volume-duration', ms(tokens.homeAmbient.musicVolumeDurationMs)],
		['motion-blog-mission-rail-enter-duration', ms(tokens.blog.missionRailEnterDurationMs)],
		['motion-blog-mission-rail-enter-offset-x', px(tokens.blog.missionRailEnterOffsetXPx)],
		['motion-blog-mission-card-enter-duration', ms(tokens.blog.missionCardEnterDurationMs)],
		['motion-blog-mission-card-enter-offset-y', px(tokens.blog.missionCardEnterOffsetYPx)],
		['motion-blog-mission-card-stagger', ms(tokens.blog.missionCardEnterStaggerMs)],
		['motion-blog-mission-exit-duration', ms(tokens.blog.missionExitDurationMs)],
		['motion-blog-mission-exit-offset-x', px(tokens.blog.missionExitOffsetXPx)],
		['motion-blog-mission-exit-stagger', ms(tokens.blog.missionExitStaggerMs)],
		['motion-blog-mission-rail-exit-delay', ms(tokens.blog.missionRailExitDelayMs)],
		['motion-blog-post-reader-swap-duration', ms(tokens.blog.postReaderSwapDurationMs)],
		['motion-blog-post-reader-swap-offset-y', px(tokens.blog.postReaderSwapOffsetYPx)],
		['motion-blog-post-aside-swap-duration', ms(tokens.blog.postAsideSwapDurationMs)],
		['motion-blog-post-aside-swap-offset-y', px(tokens.blog.postAsideSwapOffsetYPx)]
	])
}

export function createTopbarMotionCssVars(tokens: MotionTokens) {
	return createCssVars([
		['motion-topbar-stage-duration', ms(tokens.topbar.stageDurationMs)],
		['motion-topbar-stage-collapse-delay', ms(tokens.topbar.stageCollapseDelayMs)],
		['motion-topbar-stage-collapse-offset-y', rem(tokens.topbar.stageCollapseOffsetYRem)],
		['motion-topbar-reopen-opacity-duration', ms(tokens.topbar.reopenOpacityDurationMs)],
		['motion-topbar-surface-duration', ms(tokens.topbar.surfaceDurationMs)],
		['motion-topbar-profile-easing', tokens.topbar.profileTransitionEasing],
		['motion-topbar-profile-collapse-offset-x', rem(tokens.topbar.profileCollapseOffsetXRem)],
		['motion-topbar-profile-collapse-scale', tokens.topbar.profileCollapseScale],
		['motion-topbar-aside-collapse-offset-y', rem(tokens.topbar.asideCollapseOffsetYRem)],
		['motion-topbar-aside-collapse-opacity', tokens.topbar.asideCollapseOpacity],
		['motion-topbar-tool-hover-lift-y', px(tokens.topbar.toolHoverLiftYPx)],
		['motion-topbar-settings-switch-duration', ms(tokens.topbar.settingsSwitchDurationMs)],
		[
			'motion-topbar-settings-choice-color-duration',
			ms(tokens.topbar.settingsChoiceColorDurationMs)
		],
		['motion-topbar-simple-transition-offset-y', px(tokens.topbar.simpleTransitionOffsetYPx)],
		['motion-topbar-title-ghost-offset-x', px(tokens.topbar.titleGhostOffsetXPx)],
		['motion-topbar-morph-glyph-hidden-scale', tokens.topbar.morphGlyphHiddenScale],
		['motion-topbar-visual-profile-chip-gap', rem(tokens.topbarVisual.profileChipGapRem)],
		['motion-topbar-visual-profile-avatar-shift-x', tokens.topbarVisual.profileAvatarShiftX],
		['motion-topbar-visual-profile-copy-gap', rem(tokens.topbarVisual.profileCopyGapRem)]
	])
}

export function createRootMotionCssSource() {
	const landscapeTokens = getMotionTokens({ portrait: false, reducedMotion: false })
	const portraitTokens = getMotionTokens({ portrait: true, reducedMotion: false })
	const reducedTokens = getMotionTokens({ portrait: false, reducedMotion: true })
	const portraitReducedTokens = getMotionTokens({ portrait: true, reducedMotion: true })
	const createScopeCss = (tokens: MotionTokens) =>
		[createGlobalMotionCssVars(tokens), createTopbarMotionCssVars(tokens)].filter(Boolean).join(' ')

	return [
		'/* This file is generated from src/lib/motion/tokens.ts. */',
		`:root { ${createScopeCss(landscapeTokens)} }`,
		'',
		'@media (orientation: portrait) {',
		`\t:root { ${createScopeCss(portraitTokens)} }`,
		'}',
		'',
		'@media (prefers-reduced-motion: reduce) {',
		`\t:root { ${createScopeCss(reducedTokens)} }`,
		'}',
		'',
		'@media (orientation: portrait) and (prefers-reduced-motion: reduce) {',
		`\t:root { ${createScopeCss(portraitReducedTokens)} }`,
		'}',
		''
	].join('\n')
}
