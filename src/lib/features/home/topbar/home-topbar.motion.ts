import { assets } from '$app/paths'
import {
	backGradient,
	backGradientVector,
	backShellPath,
	compactDuration,
	fallbackProfilePath,
	glyphSwitchAt,
	profileGradient,
	profileGradientVector,
	profileRevealAt,
	reducedDuration,
	richDuration,
	stripDropOffset,
	stripRetreatOffset,
	stripRevealDuration,
	textExitDuration,
	toolIconSwitchAt,
	titleRevealAt
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

type BaseTransitionArgs = {
	libs: MotionLibs
	getRefs: () => HomeTopbarRefs
	setMode: (mode: TopbarMode) => void
	afterModeChange: () => Promise<void>
	setCurrentTimeline: (timeline: TimelineRef) => void
}

function getProfileContentTargets(profileChip: HTMLAnchorElement | null) {
	if (!profileChip) {
		return []
	}

	return Array.from(
		profileChip.querySelectorAll<HTMLElement>(
			'.home-profile-chip-level, strong, .home-profile-chip-copy'
		)
	)
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
		const [gsapModule, { interpolate }] = await Promise.all([import('gsap/all'), import('flubber')])
		const { gsap, Flip } = gsapModule

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

	libs.gsap.set(
		[
			refs.topbarRoot,
			refs.backButton,
			refs.backGlyph,
			refs.profileChip,
			refs.titleWrap,
			refs.stripShell,
			...getSharedTargets(refs)
		].filter(Boolean),
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
		y: nextMode === 'subpage' ? -4 : 4
	})

	await new Promise<void>((resolvePromise) => {
		const timeline = libs.gsap.timeline({
			defaults: { ease: 'power2.out' },
			onComplete: resolvePromise,
			onInterrupt: resolvePromise
		})
		setCurrentTimeline(timeline)

		timeline.to(refs.topbarRoot, {
			opacity: 1,
			y: 0,
			duration: reducedMotionActive ? reducedDuration : compactDuration
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
	profileLevel,
	authorName,
	subpageTitle
}: BaseTransitionArgs & {
	host: HTMLElement | null
	fromMode: TopbarMode
	nextMode: TopbarMode
	profileShellPath: string
	profileLevel: string
	authorName: string
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
		profileLevel,
		authorName
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
		libs.gsap.set(targetLastToolIcon, { autoAlpha: 0 })
		libs.gsap.set(toolIconTransition.targetIcon, { autoAlpha: 0 })
	}

	if (nextMode === 'subpage') {
		targetRoot.style.height = incomingStripHeight
		libs.gsap.set(targetRefs.stripShell, { autoAlpha: 0 })
		if (sourceChipSkin) {
			libs.gsap.set(targetResourceChips, {
				backgroundColor: sourceChipSkin.backgroundColor,
				borderColor: sourceChipSkin.borderColor,
				boxShadow: sourceChipSkin.boxShadow
			})
		}
		if (sourceToolsSkin && targetToolsSurface) {
			libs.gsap.set(targetToolsSurface, {
				backgroundColor: sourceToolsSkin.backgroundColor,
				borderColor: sourceToolsSkin.borderColor,
				boxShadow: sourceToolsSkin.boxShadow
			})
		}
		libs.gsap.set(targetResourceDividers, { autoAlpha: 0 })
		if (incomingStripProxy) {
			libs.gsap.set(incomingStripProxy.wrapper, {
				y: stripDropOffset,
				autoAlpha: 1
			})
			libs.gsap.set(incomingStripProxy.shell, {
				clipPath: 'inset(0 0 100% 0)'
			})
		}
		libs.gsap.set(targetRefs.backButton, {
			autoAlpha: 0
		})
		libs.gsap.set(targetRefs.backGlyph, { autoAlpha: 0 })
		libs.gsap.set(targetRefs.titleWrap, { autoAlpha: 0, x: -10 })
		libs.gsap.set(morph.text, { autoAlpha: 1 })
		libs.gsap.set(morph.glyph, { autoAlpha: 0, scale: 0.76 })
	} else {
		libs.gsap.set(targetRefs.profileChip, {
			autoAlpha: 0,
			background: 'transparent',
			backgroundImage: 'none'
		})
		libs.gsap.set(targetProfileContent, { autoAlpha: 0 })
		libs.gsap.set(morph.text, { autoAlpha: 0 })
		libs.gsap.set(morph.glyph, { autoAlpha: 1, scale: 1 })
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
					ease: 'power2.out'
				},
				0
			)

			timeline.to(
				incomingStripProxy.shell,
				{
					clipPath: 'inset(0 0 0% 0)',
					duration: stripRevealDuration,
					ease: 'power2.out'
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
					ease: 'power2.in'
				},
				0
			)

			timeline.to(
				stripGhost.shell,
				{
					clipPath: 'inset(0 0 100% 0)',
					duration: stripRevealDuration,
					ease: 'power2.in'
				},
				0
			)
		}

		if (incomingStripProxy && targetRefs.stripShell) {
			const stripHandoffAt = stripRevealDuration
			const chipSkinHandoffAt = Math.min(stripHandoffAt + 0.04, richDuration - 0.18)

			timeline.set(
				targetRefs.stripShell,
				{
					autoAlpha: 1
				},
				stripHandoffAt
			)

			timeline.set(
				incomingStripProxy.wrapper,
				{
					autoAlpha: 0
				},
				stripHandoffAt
			)

			if (targetResourceChips.length > 0) {
				timeline.to(
					targetResourceChips,
					{
						backgroundColor: 'rgba(255, 255, 255, 0)',
						borderColor: 'rgba(255, 255, 255, 0)',
						boxShadow: '0 0 0 rgba(57, 116, 177, 0)',
						duration: 0.12,
						ease: 'power1.out'
					},
					chipSkinHandoffAt
				)
			}

			if (targetToolsSurface) {
				timeline.to(
					targetToolsSurface,
					{
						backgroundColor: 'rgba(255, 255, 255, 0)',
						borderColor: 'rgba(255, 255, 255, 0)',
						boxShadow: '0 0 0 rgba(57, 116, 177, 0)',
						duration: 0.12,
						ease: 'power1.out'
					},
					chipSkinHandoffAt
				)
			}

			if (targetResourceDividers.length > 0) {
				timeline.to(
					targetResourceDividers,
					{
						autoAlpha: 1,
						duration: 0.08,
						ease: 'power1.out'
					},
					chipSkinHandoffAt + 0.03
				)
			}
		}

		if (toolIconTransition) {
			timeline.to(
				toolIconTransition.sourceIcon,
				{
					autoAlpha: 0,
					duration: 0.1,
					ease: 'power1.out'
				},
				toolIconSwitchAt
			)

			timeline.to(
				toolIconTransition.targetIcon,
				{
					autoAlpha: 1,
					duration: 0.12,
					ease: 'power1.out'
				},
				toolIconSwitchAt + 0.02
			)
		}

		timeline.add(
			libs.Flip.from(flipState, {
				targets: targetSharedTargets,
				absolute: true,
				nested: true,
				duration: richDuration,
				ease: 'power3.inOut',
				prune: true,
				stagger: (_index, target) =>
					target instanceof HTMLElement && target.dataset.flipRole === 'tools' ? 0.028 : 0
			}),
			0
		)

		timeline.to(
			morph.wrapper,
			{
				left: targetAnchorBox.left,
				top: targetAnchorBox.top,
				width: targetAnchorBox.width,
				height: targetAnchorBox.height,
				autoRound: false,
				duration: richDuration,
				ease: 'expo.inOut'
			},
			0
		)

		timeline.to(
			pathProgress,
			{
				value: 1,
				duration: richDuration,
				ease: 'expo.inOut',
				onUpdate: () => {
					morph.path.setAttribute('d', pathInterpolator(pathProgress.value))
				}
			},
			0
		)

		timeline.to(
			morph.startStop,
			{
				attr: {
					'stop-color': targetGradient.startColor,
					'stop-opacity': targetGradient.startOpacity
				},
				duration: richDuration,
				ease: 'expo.inOut'
			},
			0
		)

		timeline.to(
			morph.endStop,
			{
				attr: {
					'stop-color': targetGradient.endColor,
					'stop-opacity': targetGradient.endOpacity
				},
				duration: richDuration,
				ease: 'expo.inOut'
			},
			0
		)

		timeline.to(
			morph.gradient,
			{
				attr: {
					x1: targetGradientVector.x1,
					y1: targetGradientVector.y1,
					x2: targetGradientVector.x2,
					y2: targetGradientVector.y2
				},
				duration: richDuration,
				ease: 'expo.inOut'
			},
			0
		)

		if (fromMode === 'main') {
			const handoffAt = richDuration - 0.01

			timeline.to(
				morph.text,
				{
					autoAlpha: 0,
					duration: textExitDuration,
					ease: 'power1.out'
				},
				0
			)

			timeline.to(
				morph.glyph,
				{
					autoAlpha: 1,
					scale: 1,
					duration: 0.12,
					ease: 'power2.out'
				},
				glyphSwitchAt
			)

			timeline.set(
				morph.wrapper,
				{
					autoAlpha: 0
				},
				handoffAt
			)

			timeline.set(
				targetRefs.backButton,
				{
					autoAlpha: 1
				},
				handoffAt
			)

			timeline.set(
				targetRefs.backGlyph,
				{
					autoAlpha: 1
				},
				handoffAt
			)

			if (targetLastToolIcon) {
				timeline.set(
					targetLastToolIcon,
					{
						clearProps: 'opacity,visibility'
					},
					handoffAt
				)
			}

			if (toolIconTransition) {
				timeline.set(
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
					duration: 0.18,
					ease: 'power2.out'
				},
				titleRevealAt
			)
		} else {
			if (titleGhost) {
				timeline.to(
					titleGhost.wrapper,
					{
						x: -10,
						autoAlpha: 0,
						duration: 0.16,
						ease: 'power2.in'
					},
					0
				)
			}

			timeline.to(
				morph.glyph,
				{
					autoAlpha: 0,
					duration: 0.12,
					ease: 'power2.in'
				},
				0
			)

			timeline.to(
				morph.text,
				{
					autoAlpha: 1,
					duration: 0.18,
					ease: 'power2.out'
				},
				0.28
			)

			timeline.to(
				targetRefs.profileChip,
				{
					autoAlpha: 1,
					duration: 0.18,
					ease: 'power1.out'
				},
				profileRevealAt
			)

			timeline.set(
				targetRefs.profileChip,
				{
					clearProps: 'background,backgroundImage'
				},
				richDuration
			)

			timeline.to(
				targetProfileContent,
				{
					autoAlpha: 1,
					duration: 0.16,
					ease: 'power1.out',
					stagger: 0.03
				},
				profileRevealAt + 0.06
			)

			timeline.set(
				morph.wrapper,
				{
					autoAlpha: 0
				},
				richDuration
			)

			if (targetLastToolIcon) {
				timeline.set(
					targetLastToolIcon,
					{
						clearProps: 'opacity,visibility'
					},
					richDuration
				)
			}

			if (toolIconTransition) {
				timeline.set(
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
		libs.gsap.set(targetLastToolIcon, { clearProps: 'opacity,visibility' })
	}

	toolIconTransition?.wrapper.remove()
	incomingStripProxy?.wrapper.remove()
	stripGhost?.wrapper.remove()
	clearMotionLayer(targetRefs)
	resetTransitionStyles(libs, targetRefs)
	setCurrentTimeline(null)
}
