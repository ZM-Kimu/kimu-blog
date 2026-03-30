export type MotionEnvironment = {
	compact: boolean
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

export function msToSeconds(value: number) {
	return value / 1000
}

export function getMotionTokens({ compact, reducedMotion }: MotionEnvironment) {
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
		exitDurationMs: reducedMotion ? 60 : 120,
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
		compactHomeEnterDurationMs: reducedMotion ? 1 : 620,
		compactHomeEnterDelayPrimaryMs: reducedMotion ? 0 : 120,
		compactHomeEnterDelayMissionMs: reducedMotion ? 0 : 170,
		compactHomeEnterDelayFooterMs: reducedMotion ? 0 : 210,
		compactHomeEnterOffsetYPx: 22,
		compactHomeEnterBlurPx: 10
	}

	const background = {
		sceneCrossfadeDurationMs: reducedMotion ? 0 : 180,
		spineOverlayFadeDurationMs: reducedMotion ? 1 : 260
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

	const homeAmbient = {
		missionMarqueeDurationMs: 24000
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
		compactDurationMs: 180,
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
		morphTextRevealAtMs: 280,
		morphTextRevealDurationMs: 180,
		profileChipRevealDurationMs: 180,
		profileContentRevealDurationMs: 160,
		profileContentRevealOffsetMs: 60,
		profileContentStaggerMs: 30,
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
		compact,
		reducedMotion,
		shared,
		press,
		boot,
		route,
		background,
		error,
		homeAmbient,
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
		['motion-route-compact-enter-duration', ms(tokens.route.compactHomeEnterDurationMs)],
		['motion-route-compact-enter-delay-primary', ms(tokens.route.compactHomeEnterDelayPrimaryMs)],
		['motion-route-compact-enter-delay-mission', ms(tokens.route.compactHomeEnterDelayMissionMs)],
		['motion-route-compact-enter-delay-footer', ms(tokens.route.compactHomeEnterDelayFooterMs)],
		['motion-route-compact-enter-offset-y', px(tokens.route.compactHomeEnterOffsetYPx)],
		['motion-route-compact-enter-blur', px(tokens.route.compactHomeEnterBlurPx)],
		['motion-bg-bridge-duration', ms(tokens.background.sceneCrossfadeDurationMs)],
		['motion-bg-spine-fade-duration', ms(tokens.background.spineOverlayFadeDurationMs)],
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
		['motion-home-mission-marquee-duration', ms(tokens.homeAmbient.missionMarqueeDurationMs)]
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
	const desktopTokens = getMotionTokens({ compact: false, reducedMotion: false })
	const compactTokens = getMotionTokens({ compact: true, reducedMotion: false })
	const reducedTokens = getMotionTokens({ compact: false, reducedMotion: true })
	const compactReducedTokens = getMotionTokens({ compact: true, reducedMotion: true })
	const createScopeCss = (tokens: MotionTokens) =>
		[createGlobalMotionCssVars(tokens), createTopbarMotionCssVars(tokens)].filter(Boolean).join(' ')

	return [
		'/* This file is generated from src/lib/motion/tokens.ts. */',
		`:root { ${createScopeCss(desktopTokens)} }`,
		'',
		'@media (width <= 900px), (aspect-ratio <= 145 / 100) {',
		`\t:root { ${createScopeCss(compactTokens)} }`,
		'}',
		'',
		'@media (prefers-reduced-motion: reduce) {',
		`\t:root { ${createScopeCss(reducedTokens)} }`,
		'}',
		'',
		'@media (width <= 900px) and (prefers-reduced-motion: reduce), (aspect-ratio <= 145 / 100) and (prefers-reduced-motion: reduce) {',
		`\t:root { ${createScopeCss(compactReducedTokens)} }`,
		'}',
		''
	].join('\n')
}
