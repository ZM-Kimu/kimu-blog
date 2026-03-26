import { assets } from '$app/paths'
import
	{
		backGradient,
		backShellPath,
		compactDuration,
		fallbackProfilePath,
		glyphSwitchAt,
		profileGradient,
		profileRevealAt,
		reducedDuration,
		richDuration,
		stripDropOffset,
		stripRetreatOffset,
		stripRevealDuration,
		textExitDuration,
		titleRevealAt
	} from './home-topbar.constants'
import
	{
		clearMotionLayer,
		createMorphOverlay,
		createStripGhost,
		createTitleGhost,
		getHostElement,
		getSharedTargets,
		measureToHost
	} from './home-topbar.dom'
import type { HomeTopbarRefs, MotionLibs, TopbarMode } from './home-topbar.types'

type TimelineRef = ReturnType<typeof import('gsap').gsap.timeline> | null

type BaseTransitionArgs = {
	libs: MotionLibs
	getRefs: () => HomeTopbarRefs
	setMode: (mode: TopbarMode) => void
	afterModeChange: () => Promise<void>
	setCurrentTimeline: (timeline: TimelineRef) => void
}

const profileShadowFilter = 'drop-shadow(0 16px 42px rgba(20, 78, 143, 0.24))'
const backShadowFilter = 'drop-shadow(0 18px 34px rgba(45, 97, 179, 0.28))'

function getProfileContentTargets (profileChip: HTMLAnchorElement | null)
{
	if (!profileChip)
	{
		return []
	}

	return Array.from(
		profileChip.querySelectorAll<HTMLElement>(
			'.home-profile-chip__level, strong, .home-profile-chip__copy'
		)
	)
}

function waitForNextPaint (frames = 1)
{
	return new Promise<void>((resolve) =>
	{
		const step = (remaining: number) =>
		{
			requestAnimationFrame(() =>
			{
				if (remaining <= 1)
				{
					resolve()
					return
				}

				step(remaining - 1)
			})
		}

		step(frames)
	})
}

export async function loadProfileShellPath ()
{
	try
	{
		const response = await fetch(`${assets}/icons/home-profile-chip-mask.svg`)
		if (!response.ok)
		{
			return fallbackProfilePath
		}

		const svgText = await response.text()
		const svgDocument = new DOMParser().parseFromString(svgText, 'image/svg+xml')
		return svgDocument.querySelector('path')?.getAttribute('d') ?? fallbackProfilePath
	} catch
	{
		return fallbackProfilePath
	}
}

export async function loadMotionLibs (): Promise<MotionLibs | null>
{
	try
	{
		const [gsapModule, { interpolate }] = await Promise.all([import('gsap/all'), import('flubber')])
		const { gsap, Flip } = gsapModule

		gsap.registerPlugin(Flip)
		return { gsap, Flip, interpolate }
	} catch
	{
		return null
	}
}

export function resetTransitionStyles (libs: MotionLibs | null, refs: HomeTopbarRefs)
{
	if (!libs?.gsap)
	{
		return
	}

	libs.gsap.set(
		[
			refs.topbarRoot,
			refs.backButton,
			refs.profileChip,
			refs.titleWrap,
			refs.stripShell,
			...getSharedTargets(refs)
		].filter(Boolean),
		{ clearProps: 'opacity,transform,clipPath,pointerEvents,height' }
	)
}

export function focusAfterTransition (refs: HomeTopbarRefs, nextMode: TopbarMode)
{
	(nextMode === 'subpage' ? refs.backButton : refs.profileChip)?.focus()
}

export async function runSimpleTransition ({
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
})
{
	setMode(nextMode)
	await afterModeChange()

	const refs = getRefs()
	if (!refs.topbarRoot)
	{
		return
	}

	libs.gsap.set(refs.topbarRoot, {
		opacity: 0,
		y: nextMode === 'subpage' ? -4 : 4
	})

	await new Promise<void>((resolvePromise) =>
	{
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

export async function runRichTransition ({
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
	siteName
}: BaseTransitionArgs & {
	host: HTMLElement | null
	fromMode: TopbarMode
	nextMode: TopbarMode
	profileShellPath: string
	profileLevel: string
	authorName: string
	siteName: string
})
{
	const sourceRefs = getRefs()
	const sourceRoot = sourceRefs.topbarRoot
	const sourceAnchor = fromMode === 'subpage' ? sourceRefs.backButton : sourceRefs.profileChip
	const sourceSharedTargets = getSharedTargets(sourceRefs)

	if (!sourceRoot || !sourceAnchor || !sourceRefs.motionLayer || sourceSharedTargets.length === 0)
	{
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
	const sourceTitleBox =
		fromMode === 'subpage' && sourceRefs.titleWrap
			? measureToHost(host, sourceRefs, sourceRefs.titleWrap)
			: null
	const flipState = libs.Flip.getState(sourceSharedTargets)

	clearMotionLayer(sourceRefs)
	resetTransitionStyles(libs, sourceRefs)

	const stripGhost =
		fromMode === 'subpage'
			? createStripGhost(
				sourceHost,
				sourceHeaderBox,
				'home-topbar home-topbar--subpage home-topbar-strip-proxy home-topbar-strip-proxy--background'
			)
			: null
	const titleGhost = sourceTitleBox ? createTitleGhost(sourceRefs, sourceTitleBox, siteName) : null

	setMode(nextMode)
	await afterModeChange()

	const targetRefs = getRefs()
	const targetRoot = targetRefs.topbarRoot
	const targetAnchor = nextMode === 'subpage' ? targetRefs.backButton : targetRefs.profileChip
	const targetSharedTargets = getSharedTargets(targetRefs)

	if (!targetRoot || !targetAnchor || targetSharedTargets.length === 0)
	{
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
	if (!morph)
	{
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
				'home-topbar home-topbar--subpage home-topbar-strip-proxy home-topbar-strip-proxy--background'
			)
			: null
	const incomingStripHeight =
		incomingStripProxy
			? `${incomingStripProxy.wrapper.getBoundingClientRect().height}px`
			: `${targetHeaderBox.height}px`
	const targetProfileContent = nextMode === 'main' ? getProfileContentTargets(targetRefs.profileChip) : []
	const pathInterpolator = libs.interpolate(
		fromMode === 'main' ? profileShellPath : backShellPath,
		nextMode === 'subpage' ? backShellPath : profileShellPath,
		{ maxSegmentLength: 2 }
	)
	const pathProgress = { value: 0 }
	const targetGradient = nextMode === 'subpage' ? backGradient : profileGradient
	const targetShadowFilter = nextMode === 'subpage' ? backShadowFilter : profileShadowFilter

	if (nextMode === 'subpage')
	{
		targetRoot.style.height = incomingStripHeight
		libs.gsap.set(targetRefs.stripShell, { autoAlpha: 0 })
		if (incomingStripProxy)
		{
			libs.gsap.set(incomingStripProxy.wrapper, {
				y: stripDropOffset,
				autoAlpha: 1
			})
			libs.gsap.set(incomingStripProxy.shell, {
				clipPath: 'inset(0 0 100% 0)'
			})
		}
		libs.gsap.set(targetRefs.backButton, { autoAlpha: 0 })
		libs.gsap.set(targetRefs.titleWrap, { autoAlpha: 0, x: -10 })
		libs.gsap.set(morph.text, { autoAlpha: 1 })
		libs.gsap.set(morph.glyph, { autoAlpha: 0, scale: 0.76 })
	} else
	{
		libs.gsap.set(targetRefs.profileChip, { autoAlpha: 0 })
		libs.gsap.set(targetProfileContent, { autoAlpha: 0 })
		libs.gsap.set(morph.text, { autoAlpha: 0 })
		libs.gsap.set(morph.glyph, { autoAlpha: 1, scale: 1 })
	}

	if (nextMode === 'subpage' && incomingStripProxy)
	{
		// Let the proxy's true starting state paint before FLIP/timeline work begins.
		await waitForNextPaint(2)
	}

	await new Promise<void>((resolvePromise) =>
	{
		const timeline = libs.gsap.timeline({
			onComplete: resolvePromise,
			onInterrupt: resolvePromise
		})
		setCurrentTimeline(timeline)

		if (incomingStripProxy)
		{
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

		if (stripGhost)
		{
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

		if (incomingStripProxy && targetRefs.stripShell)
		{
			const stripHandoffAt = Math.max(stripRevealDuration - 0.06, 0.18)
			const stripHandoffDuration = 0.1

			timeline.to(
				targetRefs.stripShell,
				{
					autoAlpha: 1,
					duration: stripHandoffDuration,
					ease: 'power1.out'
				},
				stripHandoffAt
			)

			timeline.to(
				incomingStripProxy.wrapper,
				{
					autoAlpha: 0,
					duration: stripHandoffDuration,
					ease: 'power1.out'
				},
				stripHandoffAt
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
				filter: targetShadowFilter,
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
				onUpdate: () =>
				{
					morph.path.setAttribute('d', pathInterpolator(pathProgress.value))
				}
			},
			0
		)

		timeline.to(
			morph.startStop,
			{
				attr: { 'stop-color': targetGradient.start },
				duration: richDuration,
				ease: 'expo.inOut'
			},
			0
		)

		timeline.to(
			morph.endStop,
			{
				attr: { 'stop-color': targetGradient.end },
				duration: richDuration,
				ease: 'expo.inOut'
			},
			0
		)

		if (fromMode === 'main')
		{
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

			timeline.to(
				targetRefs.backButton,
				{
					autoAlpha: 1,
					duration: 0.14,
					ease: 'power1.out'
				},
				titleRevealAt
			)

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
		} else
		{
			if (titleGhost)
			{
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
					scale: 0.82,
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
		}

		timeline.to(
			morph.wrapper,
			{
				autoAlpha: 0,
				duration: 0.06,
				ease: 'power1.out'
			},
			richDuration - 0.06
		)
	})

	incomingStripProxy?.wrapper.remove()
	stripGhost?.wrapper.remove()
	clearMotionLayer(targetRefs)
	resetTransitionStyles(libs, targetRefs)
	setCurrentTimeline(null)
}
