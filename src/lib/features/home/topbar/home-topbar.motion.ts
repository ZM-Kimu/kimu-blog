import { assets } from '$app/paths'
import { getMotionTokens, msToSeconds } from '$lib/motion/tokens'
import {
	backGradient,
	backGradientVector,
	backShellPath,
	fallbackProfilePath,
	profileGradient,
	profileGradientVector
} from './home-topbar.constants'
import {
	clearMotionLayer,
	createMorphOverlay,
	createStripGhost,
	createToolIconTransitionOverlay,
	createTitleGhost,
	getHostElement,
	getSharedTargets,
	measureToHost
} from './home-topbar.dom'
import type { HomeTopbarRefs, MotionLibs, TopbarMode } from './home-topbar.types'

type TimelineRef = ReturnType<typeof import('gsap').gsap.timeline> | null
type SurfaceSkin = {
	backgroundColor: string
	borderColor: string
	boxShadow: string
}

type GsapTarget = Element | object

type BaseTransitionArgs = {
	libs: MotionLibs
	getRefs: () => HomeTopbarRefs
	setMode: (mode: TopbarMode) => void
	afterModeChange: () => Promise<void>
	setCurrentTimeline: (timeline: TimelineRef) => void
}

const topbarMotion = getMotionTokens({ portrait: false, reducedMotion: false }).topbar
const portraitDuration = msToSeconds(topbarMotion.portraitDurationMs)
const reducedDuration = msToSeconds(topbarMotion.reducedDurationMs)
const richDuration = msToSeconds(topbarMotion.richDurationMs)
const stripRevealDuration = msToSeconds(topbarMotion.stripRevealDurationMs)
const stripDropOffset = topbarMotion.stripDropOffsetPx
const stripRetreatOffset = topbarMotion.stripRetreatOffsetPx
const titleRevealAt = msToSeconds(topbarMotion.titleRevealAtMs)
const profileRevealAt = msToSeconds(topbarMotion.profileRevealAtMs)
const glyphSwitchAt = msToSeconds(topbarMotion.glyphSwitchAtMs)
const toolIconSwitchAt = msToSeconds(topbarMotion.toolIconSwitchAtMs)
const textExitDuration = msToSeconds(topbarMotion.textExitDurationMs)
const chipSkinFadeDuration = msToSeconds(topbarMotion.chipSkinFadeDurationMs)
const chipSkinHandoffOffset = msToSeconds(topbarMotion.chipSkinHandoffOffsetMs)
const chipSkinHandoffTailBuffer = msToSeconds(topbarMotion.chipSkinHandoffTailBufferMs)
const resourceDividerRevealDuration = msToSeconds(topbarMotion.resourceDividerRevealDurationMs)
const resourceDividerRevealOffset = msToSeconds(topbarMotion.resourceDividerRevealOffsetMs)
const toolIconFadeOutDuration = msToSeconds(topbarMotion.toolIconFadeOutDurationMs)
const toolIconFadeInDuration = msToSeconds(topbarMotion.toolIconFadeInDurationMs)
const toolIconFadeInOffset = msToSeconds(topbarMotion.toolIconFadeInOffsetMs)
const flipStagger = msToSeconds(topbarMotion.flipStaggerMs)
const backTitleRevealDuration = msToSeconds(topbarMotion.backTitleRevealDurationMs)
const titleGhostExitDuration = msToSeconds(topbarMotion.titleGhostExitDurationMs)
const glyphFadeDuration = msToSeconds(topbarMotion.glyphFadeDurationMs)
const morphTextRevealAt = msToSeconds(topbarMotion.morphTextRevealAtMs)
const morphTextRevealDuration = msToSeconds(topbarMotion.morphTextRevealDurationMs)
const profileChipRevealDuration = msToSeconds(topbarMotion.profileChipRevealDurationMs)
const profileContentRevealDuration = msToSeconds(topbarMotion.profileContentRevealDurationMs)
const profileContentRevealOffset = msToSeconds(topbarMotion.profileContentRevealOffsetMs)
const profileContentStagger = msToSeconds(topbarMotion.profileContentStaggerMs)
const morphHideLead = msToSeconds(topbarMotion.morphHideLeadMs)
const simpleTransitionOffsetY = topbarMotion.simpleTransitionOffsetYPx
const titleGhostOffsetX = topbarMotion.titleGhostOffsetXPx
const morphGlyphHiddenScale = topbarMotion.morphGlyphHiddenScale
const gsapEasePower1Out = topbarMotion.gsapEasePower1Out
const gsapEasePower2Out = topbarMotion.gsapEasePower2Out
const gsapEasePower2In = topbarMotion.gsapEasePower2In
const gsapEasePower3InOut = topbarMotion.gsapEasePower3InOut
const gsapEaseExpoInOut = topbarMotion.gsapEaseExpoInOut

function normalizeGsapTargets(
	targets: GsapTarget | Array<GsapTarget | null | undefined | false> | null | undefined | false
) {
	if (Array.isArray(targets)) {
		return targets.filter((target): target is GsapTarget => Boolean(target))
	}

	return targets ? [targets] : []
}

function setGsapTargets(
	libs: MotionLibs,
	targets: GsapTarget | Array<GsapTarget | null | undefined | false> | null | undefined | false,
	vars: Record<string, unknown>
) {
	const resolvedTargets = normalizeGsapTargets(targets)
	if (resolvedTargets.length === 0) {
		return
	}

	libs.gsap.set(resolvedTargets.length === 1 ? resolvedTargets[0] : resolvedTargets, vars)
}

function setTimelineTargets(
	timeline: ReturnType<MotionLibs['gsap']['timeline']>,
	targets: GsapTarget | Array<GsapTarget | null | undefined | false> | null | undefined | false,
	vars: Record<string, unknown>,
	position?: number | string
) {
	const resolvedTargets = normalizeGsapTargets(targets)
	if (resolvedTargets.length === 0) {
		return
	}

	;(timeline.set as (...args: Array<unknown>) => unknown)(
		resolvedTargets.length === 1 ? resolvedTargets[0] : resolvedTargets,
		vars,
		position
	)
}

function toTimelineTargets(
	timeline: ReturnType<MotionLibs['gsap']['timeline']>,
	targets: GsapTarget | Array<GsapTarget | null | undefined | false> | null | undefined | false,
	vars: Record<string, unknown>,
	position?: number | string
) {
	const resolvedTargets = normalizeGsapTargets(targets)
	if (resolvedTargets.length === 0) {
		return
	}

	;(timeline.to as (...args: Array<unknown>) => unknown)(
		resolvedTargets.length === 1 ? resolvedTargets[0] : resolvedTargets,
		vars,
		position
	)
}

function getProfileContentTargets(profileChip: HTMLAnchorElement | null) {
	if (!profileChip) {
		return []
	}

	return Array.from(profileChip.querySelectorAll<HTMLElement>('.home-profile-chip-copy'))
}

function captureSurfaceSkin(element: HTMLElement | null): SurfaceSkin | null {
	if (!element) {
		return null
	}

	const computedStyle = getComputedStyle(element)

	return {
		backgroundColor: computedStyle.backgroundColor,
		borderColor: computedStyle.borderTopColor,
		boxShadow: computedStyle.boxShadow
	}
}

function waitForNextPaint(frames = 1) {
	return new Promise<void>((resolve) => {
		const step = (remaining: number) => {
			requestAnimationFrame(() => {
				if (remaining <= 1) {
					resolve()
					return
				}

				step(remaining - 1)
			})
		}

		step(frames)
	})
}

export async function loadProfileShellPath() {
	try {
		const response = await fetch(`${assets}/icons/home-profile-chip-mask.svg`)
		if (!response.ok) {
			return fallbackProfilePath
		}

		const svgText = await response.text()
		const svgDocument = new DOMParser().parseFromString(svgText, 'image/svg+xml')
		return svgDocument.querySelector('path')?.getAttribute('d') ?? fallbackProfilePath
	} catch {
		return fallbackProfilePath
	}
}

export async function loadMotionLibs(): Promise<MotionLibs | null> {
	try {
		const [gsapModule, flipModule, { interpolate }] = await Promise.all([
			import('gsap'),
			// @ts-expect-error GSAP ships a Windows-hostile Flip.d.ts casing pair; runtime path is valid.
			import('gsap/Flip.js'),
			import('flubber')
		])
		const { gsap } = gsapModule
		const { Flip } = flipModule as { Flip: MotionLibs['Flip'] }

		gsap.registerPlugin(Flip)
		return { gsap, Flip, interpolate }
	} catch {
		return null
	}
}

export function resetTransitionStyles(libs: MotionLibs | null, refs: HomeTopbarRefs) {
	if (!libs?.gsap) {
		return
	}

	setGsapTargets(
		libs,
		[
			refs.topbarRoot,
			refs.backButton,
			refs.backGlyph,
			refs.profileChip,
			refs.titleWrap,
			refs.stripShell,
			...getSharedTargets(refs)
		],
		{
			clearProps:
				'opacity,transform,clipPath,pointerEvents,height,filter,boxShadow,background,backgroundImage,backgroundColor,borderColor'
		}
	)
}

export function focusAfterTransition(refs: HomeTopbarRefs, nextMode: TopbarMode) {
	;(nextMode === 'subpage' ? refs.backButton : refs.profileChip)?.focus()
}

export async function runSimpleTransition({
	libs,
	getRefs,
	nextMode,
	reducedMotionActive,
	setMode,
	afterModeChange,
	setCurrentTimeline
}: BaseTransitionArgs & {
	nextMode: TopbarMode
	reducedMotionActive: boolean
}) {
	setMode(nextMode)
	await afterModeChange()

	const refs = getRefs()
	if (!refs.topbarRoot) {
		return
	}

	libs.gsap.set(refs.topbarRoot, {
		opacity: 0,
		y: nextMode === 'subpage' ? simpleTransitionOffsetY * -1 : simpleTransitionOffsetY
	})

	await new Promise<void>((resolvePromise) => {
		const timeline = libs.gsap.timeline({
			defaults: { ease: gsapEasePower2Out },
			onComplete: resolvePromise,
			onInterrupt: resolvePromise
		})
		setCurrentTimeline(timeline)

		timeline.to(refs.topbarRoot, {
			opacity: 1,
			y: 0,
			duration: reducedMotionActive ? reducedDuration : portraitDuration
		})
	})

	resetTransitionStyles(libs, getRefs())
	setCurrentTimeline(null)
}

export async function runRichTransition({
	libs,
	host,
	getRefs,
	fromMode,
	nextMode,
	setMode,
	afterModeChange,
	setCurrentTimeline,
	profileShellPath,
	authorName,
	infoLabel,
	subpageTitle
}: BaseTransitionArgs & {
	host: HTMLElement | null
	fromMode: TopbarMode
	nextMode: TopbarMode
	profileShellPath: string
	authorName: string
	infoLabel: string
	subpageTitle: string
}) {
	const sourceRefs = getRefs()
	const sourceRoot = sourceRefs.topbarRoot
	const sourceAnchor = fromMode === 'subpage' ? sourceRefs.backButton : sourceRefs.profileChip
	const sourceSharedTargets = getSharedTargets(sourceRefs)

	if (!sourceRoot || !sourceAnchor || !sourceRefs.motionLayer || sourceSharedTargets.length === 0) {
		await runSimpleTransition({
			libs,
			getRefs,
			nextMode,
			reducedMotionActive: false,
			setMode,
			afterModeChange,
			setCurrentTimeline
		})
		return
	}

	const sourceAnchorBox = measureToHost(host, sourceRefs, sourceAnchor)
	const sourceHeaderBox = measureToHost(host, sourceRefs, sourceRoot)
	const sourceHost = getHostElement(host, sourceRefs)
	const sourceChipSkin =
		fromMode === 'main'
			? captureSurfaceSkin(
					sourceRoot.querySelector<HTMLElement>('.home-topbar-resources .resource-chip')
				)
			: null
	const sourceToolsSkin =
		fromMode === 'main'
			? captureSurfaceSkin(sourceRoot.querySelector<HTMLElement>('.home-topbar-tools'))
			: null
	const sourceTitleBox =
		fromMode === 'subpage' && sourceRefs.titleWrap
			? measureToHost(host, sourceRefs, sourceRefs.titleWrap)
			: null
	const sourceToolButtons = Array.from(
		sourceRoot.querySelectorAll<HTMLElement>('.home-topbar-tool-button')
	)
	const sourceLastToolIcon =
		sourceToolButtons.at(-1)?.querySelector<HTMLElement>('.home-topbar-icon') ?? null
	const flipState = libs.Flip.getState(sourceSharedTargets)

	clearMotionLayer(sourceRefs)
	resetTransitionStyles(libs, sourceRefs)

	const stripGhost =
		fromMode === 'subpage'
			? createStripGhost(
					sourceHost,
					sourceHeaderBox,
					'home-topbar home-topbar-subpage home-topbar-strip-proxy home-topbar-strip-proxy-background'
				)
			: null
	const titleGhost = sourceTitleBox
		? createTitleGhost(sourceRefs, sourceTitleBox, subpageTitle)
		: null

	setMode(nextMode)
	await afterModeChange()

	const targetRefs = getRefs()
	const targetRoot = targetRefs.topbarRoot
	const targetAnchor = nextMode === 'subpage' ? targetRefs.backButton : targetRefs.profileChip
	const targetSharedTargets = getSharedTargets(targetRefs)

	if (!targetRoot || !targetAnchor || targetSharedTargets.length === 0) {
		stripGhost?.wrapper.remove()
		clearMotionLayer(targetRefs)
		resetTransitionStyles(libs, targetRefs)
		await runSimpleTransition({
			libs,
			getRefs,
			nextMode,
			reducedMotionActive: false,
			setMode,
			afterModeChange,
			setCurrentTimeline
		})
		return
	}

	const targetHeaderBox = measureToHost(host, targetRefs, targetRoot)
	const targetHost = getHostElement(host, targetRefs)
	const morph = createMorphOverlay({
		refs: targetRefs,
		fromMode,
		box: sourceAnchorBox,
		profileShellPath,
		authorName,
		infoLabel
	})
	if (!morph) {
		stripGhost?.wrapper.remove()
		clearMotionLayer(targetRefs)
		resetTransitionStyles(libs, targetRefs)
		await runSimpleTransition({
			libs,
			getRefs,
			nextMode,
			reducedMotionActive: false,
			setMode,
			afterModeChange,
			setCurrentTimeline
		})
		return
	}

	const targetAnchorBox = measureToHost(host, targetRefs, targetAnchor)
	const incomingStripProxy =
		nextMode === 'subpage'
			? createStripGhost(
					targetHost,
					targetHeaderBox,
					'home-topbar home-topbar-subpage home-topbar-strip-proxy home-topbar-strip-proxy-background'
				)
			: null
	const incomingStripHeight = incomingStripProxy
		? `${incomingStripProxy.wrapper.getBoundingClientRect().height}px`
		: `${targetHeaderBox.height}px`
	const targetProfileContent =
		nextMode === 'main' ? getProfileContentTargets(targetRefs.profileChip) : []
	const targetToolButtons = Array.from(
		targetRoot.querySelectorAll<HTMLElement>('.home-topbar-tool-button')
	)
	const targetLastToolButton = targetToolButtons.at(-1) ?? null
	const targetLastToolIcon =
		targetLastToolButton?.querySelector<HTMLElement>('.home-topbar-icon') ?? null
	const targetResourceChips =
		nextMode === 'subpage'
			? Array.from(
					targetRoot.querySelectorAll<HTMLElement>('.home-topbar-resources .resource-chip')
				)
			: []
	const targetResourceDividers =
		nextMode === 'subpage'
			? Array.from(targetRoot.querySelectorAll<HTMLElement>('.home-topbar-resource-divider'))
			: []
	const targetToolsSurface =
		nextMode === 'subpage' ? targetRoot.querySelector<HTMLElement>('.home-topbar-tools') : null
	const pathInterpolator = libs.interpolate(
		fromMode === 'main' ? profileShellPath : backShellPath,
		nextMode === 'subpage' ? backShellPath : profileShellPath,
		{ maxSegmentLength: 2 }
	)
	const pathProgress = { value: 0 }
	const targetGradient = nextMode === 'subpage' ? backGradient : profileGradient
	const targetGradientVector = nextMode === 'subpage' ? backGradientVector : profileGradientVector
	const toolIconTransition =
		sourceLastToolIcon &&
		targetLastToolButton &&
		targetLastToolIcon &&
		sourceLastToolIcon.getAttribute('style') !== targetLastToolIcon.getAttribute('style')
			? createToolIconTransitionOverlay(
					targetLastToolButton,
					sourceLastToolIcon,
					targetLastToolIcon
				)
			: null

	if (toolIconTransition && targetLastToolIcon) {
		setGsapTargets(libs, targetLastToolIcon, { autoAlpha: 0 })
		setGsapTargets(libs, toolIconTransition.targetIcon, { autoAlpha: 0 })
	}

	if (nextMode === 'subpage') {
		targetRoot.style.height = incomingStripHeight
		setGsapTargets(libs, targetRefs.stripShell, { autoAlpha: 0 })
		if (sourceChipSkin) {
			setGsapTargets(libs, targetResourceChips, {
				backgroundColor: sourceChipSkin.backgroundColor,
				borderColor: sourceChipSkin.borderColor,
				boxShadow: sourceChipSkin.boxShadow
			})
		}
		if (sourceToolsSkin && targetToolsSurface) {
			setGsapTargets(libs, targetToolsSurface, {
				backgroundColor: sourceToolsSkin.backgroundColor,
				borderColor: sourceToolsSkin.borderColor,
				boxShadow: sourceToolsSkin.boxShadow
			})
		}
		setGsapTargets(libs, targetResourceDividers, { autoAlpha: 0 })
		if (incomingStripProxy) {
			setGsapTargets(libs, incomingStripProxy.wrapper, {
				y: stripDropOffset,
				autoAlpha: 1
			})
			setGsapTargets(libs, incomingStripProxy.shell, {
				clipPath: 'inset(0 0 100% 0)'
			})
		}
		setGsapTargets(libs, targetRefs.backButton, {
			autoAlpha: 0
		})
		setGsapTargets(libs, targetRefs.backGlyph, { autoAlpha: 0 })
		setGsapTargets(libs, targetRefs.titleWrap, { autoAlpha: 0, x: titleGhostOffsetX * -1 })
		setGsapTargets(libs, morph.text, { autoAlpha: 1 })
		setGsapTargets(libs, morph.glyph, { autoAlpha: 0, scale: morphGlyphHiddenScale })
	} else {
		setGsapTargets(libs, targetRefs.profileChip, {
			autoAlpha: 0,
			background: 'transparent',
			backgroundImage: 'none'
		})
		setGsapTargets(libs, targetProfileContent, { autoAlpha: 0 })
		setGsapTargets(libs, morph.text, { autoAlpha: 0 })
		setGsapTargets(libs, morph.glyph, { autoAlpha: 1, scale: 1 })
	}

	if (nextMode === 'subpage' && incomingStripProxy) {
		// Let the proxy's true starting state paint before FLIP/timeline work begins.
		await waitForNextPaint(2)
	} else if (fromMode === 'subpage') {
		// Let the reverse-path glyph and back-shadow state paint before it begins fading out.
		await waitForNextPaint(1)
	}

	await new Promise<void>((resolvePromise) => {
		const timeline = libs.gsap.timeline({
			onComplete: resolvePromise,
			onInterrupt: resolvePromise
		})
		setCurrentTimeline(timeline)

		if (incomingStripProxy) {
			timeline.to(
				incomingStripProxy.wrapper,
				{
					y: 0,
					duration: stripRevealDuration,
					ease: gsapEasePower2Out
				},
				0
			)

			timeline.to(
				incomingStripProxy.shell,
				{
					clipPath: 'inset(0 0 0% 0)',
					duration: stripRevealDuration,
					ease: gsapEasePower2Out
				},
				0
			)
		}

		if (stripGhost) {
			timeline.to(
				stripGhost.wrapper,
				{
					y: stripRetreatOffset,
					duration: stripRevealDuration,
					ease: gsapEasePower2In
				},
				0
			)

			timeline.to(
				stripGhost.shell,
				{
					clipPath: 'inset(0 0 100% 0)',
					duration: stripRevealDuration,
					ease: gsapEasePower2In
				},
				0
			)
		}

		if (incomingStripProxy && targetRefs.stripShell) {
			const stripHandoffAt = stripRevealDuration
			const chipSkinHandoffAt = Math.min(
				stripHandoffAt + chipSkinHandoffOffset,
				richDuration - chipSkinHandoffTailBuffer
			)

			setTimelineTargets(
				timeline,
				targetRefs.stripShell,
				{
					autoAlpha: 1
				},
				stripHandoffAt
			)

			setTimelineTargets(
				timeline,
				incomingStripProxy.wrapper,
				{
					autoAlpha: 0
				},
				stripHandoffAt
			)

			if (targetResourceChips.length > 0) {
				toTimelineTargets(
					timeline,
					targetResourceChips,
					{
						backgroundColor: 'rgba(255, 255, 255, 0)',
						borderColor: 'rgba(255, 255, 255, 0)',
						boxShadow: '0 0 0 rgba(57, 116, 177, 0)',
						duration: chipSkinFadeDuration,
						ease: gsapEasePower1Out
					},
					chipSkinHandoffAt
				)
			}

			if (targetToolsSurface) {
				toTimelineTargets(
					timeline,
					targetToolsSurface,
					{
						backgroundColor: 'rgba(255, 255, 255, 0)',
						borderColor: 'rgba(255, 255, 255, 0)',
						boxShadow: '0 0 0 rgba(57, 116, 177, 0)',
						duration: chipSkinFadeDuration,
						ease: gsapEasePower1Out
					},
					chipSkinHandoffAt
				)
			}

			if (targetResourceDividers.length > 0) {
				toTimelineTargets(
					timeline,
					targetResourceDividers,
					{
						autoAlpha: 1,
						duration: resourceDividerRevealDuration,
						ease: gsapEasePower1Out
					},
					chipSkinHandoffAt + resourceDividerRevealOffset
				)
			}
		}

		if (toolIconTransition) {
			toTimelineTargets(
				timeline,
				toolIconTransition.sourceIcon,
				{
					autoAlpha: 0,
					duration: toolIconFadeOutDuration,
					ease: gsapEasePower1Out
				},
				toolIconSwitchAt
			)

			toTimelineTargets(
				timeline,
				toolIconTransition.targetIcon,
				{
					autoAlpha: 1,
					duration: toolIconFadeInDuration,
					ease: gsapEasePower1Out
				},
				toolIconSwitchAt + toolIconFadeInOffset
			)
		}

		timeline.add(
			libs.Flip.from(flipState, {
				targets: targetSharedTargets,
				absolute: true,
				nested: true,
				duration: richDuration,
				ease: gsapEasePower3InOut,
				prune: true,
				stagger: (_index: number, target: Element) =>
					target instanceof HTMLElement && target.dataset.flipRole === 'tools' ? flipStagger : 0
			}) as Parameters<typeof timeline.add>[0],
			0
		)

		toTimelineTargets(
			timeline,
			morph.wrapper,
			{
				left: targetAnchorBox.left,
				top: targetAnchorBox.top,
				width: targetAnchorBox.width,
				height: targetAnchorBox.height,
				autoRound: false,
				duration: richDuration,
				ease: gsapEaseExpoInOut
			},
			0
		)

		timeline.to(
			pathProgress,
			{
				value: 1,
				duration: richDuration,
				ease: gsapEaseExpoInOut,
				onUpdate: () => {
					morph.path.setAttribute('d', pathInterpolator(pathProgress.value))
				}
			},
			0
		)

		toTimelineTargets(
			timeline,
			morph.startStop,
			{
				attr: {
					'stop-color': targetGradient.startColor,
					'stop-opacity': targetGradient.startOpacity
				},
				duration: richDuration,
				ease: gsapEaseExpoInOut
			},
			0
		)

		toTimelineTargets(
			timeline,
			morph.endStop,
			{
				attr: {
					'stop-color': targetGradient.endColor,
					'stop-opacity': targetGradient.endOpacity
				},
				duration: richDuration,
				ease: gsapEaseExpoInOut
			},
			0
		)

		toTimelineTargets(
			timeline,
			morph.gradient,
			{
				attr: {
					x1: targetGradientVector.x1,
					y1: targetGradientVector.y1,
					x2: targetGradientVector.x2,
					y2: targetGradientVector.y2
				},
				duration: richDuration,
				ease: gsapEaseExpoInOut
			},
			0
		)

		if (fromMode === 'main') {
			const handoffAt = richDuration - morphHideLead

			toTimelineTargets(
				timeline,
				morph.text,
				{
					autoAlpha: 0,
					duration: textExitDuration,
					ease: gsapEasePower1Out
				},
				0
			)

			toTimelineTargets(
				timeline,
				morph.glyph,
				{
					autoAlpha: 1,
					scale: 1,
					duration: glyphFadeDuration,
					ease: gsapEasePower2Out
				},
				glyphSwitchAt
			)

			setTimelineTargets(
				timeline,
				morph.wrapper,
				{
					autoAlpha: 0
				},
				handoffAt
			)

			setTimelineTargets(
				timeline,
				targetRefs.backButton,
				{
					autoAlpha: 1
				},
				handoffAt
			)

			setTimelineTargets(
				timeline,
				targetRefs.backGlyph,
				{
					autoAlpha: 1
				},
				handoffAt
			)

			if (targetLastToolIcon) {
				setTimelineTargets(
					timeline,
					targetLastToolIcon,
					{
						clearProps: 'opacity,visibility'
					},
					handoffAt
				)
			}

			if (toolIconTransition) {
				setTimelineTargets(
					timeline,
					toolIconTransition.wrapper,
					{
						autoAlpha: 0
					},
					handoffAt
				)
			}

			timeline.to(
				targetRefs.titleWrap,
				{
					autoAlpha: 1,
					x: 0,
					duration: backTitleRevealDuration,
					ease: gsapEasePower2Out
				},
				titleRevealAt
			)
		} else {
			if (titleGhost) {
				toTimelineTargets(
					timeline,
					titleGhost.wrapper,
					{
						x: titleGhostOffsetX * -1,
						autoAlpha: 0,
						duration: titleGhostExitDuration,
						ease: gsapEasePower2In
					},
					0
				)
			}

			toTimelineTargets(
				timeline,
				morph.glyph,
				{
					autoAlpha: 0,
					duration: glyphFadeDuration,
					ease: gsapEasePower2In
				},
				0
			)

			toTimelineTargets(
				timeline,
				morph.text,
				{
					autoAlpha: 1,
					duration: morphTextRevealDuration,
					ease: gsapEasePower2Out
				},
				morphTextRevealAt
			)

			toTimelineTargets(
				timeline,
				targetRefs.profileChip,
				{
					autoAlpha: 1,
					duration: profileChipRevealDuration,
					ease: gsapEasePower1Out
				},
				profileRevealAt
			)

			setTimelineTargets(
				timeline,
				targetRefs.profileChip,
				{
					clearProps: 'background,backgroundImage'
				},
				richDuration
			)

			toTimelineTargets(
				timeline,
				targetProfileContent,
				{
					autoAlpha: 1,
					duration: profileContentRevealDuration,
					ease: gsapEasePower1Out,
					stagger: profileContentStagger
				},
				profileRevealAt + profileContentRevealOffset
			)

			setTimelineTargets(
				timeline,
				morph.wrapper,
				{
					autoAlpha: 0
				},
				richDuration
			)

			if (targetLastToolIcon) {
				setTimelineTargets(
					timeline,
					targetLastToolIcon,
					{
						clearProps: 'opacity,visibility'
					},
					richDuration
				)
			}

			if (toolIconTransition) {
				setTimelineTargets(
					timeline,
					toolIconTransition.wrapper,
					{
						autoAlpha: 0
					},
					richDuration
				)
			}
		}
	})

	if (targetLastToolIcon) {
		setGsapTargets(libs, targetLastToolIcon, { clearProps: 'opacity,visibility' })
	}

	toolIconTransition?.wrapper.remove()
	incomingStripProxy?.wrapper.remove()
	stripGhost?.wrapper.remove()
	clearMotionLayer(targetRefs)
	resetTransitionStyles(libs, targetRefs)
	setCurrentTimeline(null)
}
