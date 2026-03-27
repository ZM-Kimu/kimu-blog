<script lang="ts">
	import { createEventDispatcher, onMount, tick } from 'svelte'
	import HomeTopbarMain from './HomeTopbarMain.svelte'
	import HomeTopbarSubpage from './HomeTopbarSubpage.svelte'
	import { fallbackProfilePath } from './home-topbar.constants'
	import {
		focusAfterTransition,
		loadMotionLibs,
		loadProfileShellPath,
		resetTransitionStyles,
		runRichTransition,
		runSimpleTransition
	} from './home-topbar.motion'
	import type {
		HomeTopbarAction,
		HomeTopbarMetric,
		HomeTopbarRefs,
		HomeTopbarStateDetail,
		MotionLibs,
		TopbarMode,
		TriggerOrigin
	} from './home-topbar.types'

	let {
		host = null,
		mainMetrics,
		mainActions,
		subpageMetrics,
		subpageActions,
		subpageTitle,
		authorName,
		profileLevel = '90',
		profileHref = '/about',
		compact = false,
		reducedMotion = false,
		onSubpageBack
	}: {
		host?: HTMLElement | null
		mainMetrics: readonly HomeTopbarMetric[]
		mainActions: readonly HomeTopbarAction[]
		subpageMetrics: readonly HomeTopbarMetric[]
		subpageActions: readonly HomeTopbarAction[]
		subpageTitle: string
		authorName: string
		profileLevel?: string
		profileHref?: '/' | '/about'
		compact?: boolean
		reducedMotion?: boolean
		onSubpageBack?: (() => void) | undefined
	} = $props()

	const dispatch = createEventDispatcher<{
		statechange: HomeTopbarStateDetail
	}>()

	let mode = $state<TopbarMode>('main')
	let motionLocked = $state(false)
	let motionLibs: MotionLibs | null = null
	let currentTimeline: ReturnType<typeof import('gsap').gsap.timeline> | null = null
	let profileShellPath = $state(fallbackProfilePath)
	let topbarRoot: HTMLElement | null = $state(null)
	let backButton: HTMLButtonElement | null = $state(null)
	let backGlyph: HTMLSpanElement | null = $state(null)
	let profileChip: HTMLAnchorElement | null = $state(null)
	let titleWrap: HTMLDivElement | null = $state(null)
	let stripShell: HTMLDivElement | null = $state(null)
	let motionLayer: HTMLDivElement | null = $state(null)

	$effect(() => {
		dispatch('statechange', { mode, locked: motionLocked })
	})

	function getRefs(): HomeTopbarRefs {
		return {
			topbarRoot,
			backButton,
			backGlyph,
			profileChip,
			titleWrap,
			stripShell,
			motionLayer
		}
	}

	function setCurrentTimeline(timeline: ReturnType<typeof import('gsap').gsap.timeline> | null) {
		currentTimeline = timeline
	}

	async function requestTransition(nextMode: TopbarMode) {
		if (motionLocked || nextMode === mode) {
			return
		}

		motionLocked = true
		let transitionSucceeded = false

		try {
			const libs = motionLibs ?? (await loadMotionLibs())
			if (libs && !motionLibs) {
				motionLibs = libs
			}

			if (compact || reducedMotion || !libs) {
				if (!libs) {
					mode = nextMode
					await tick()
				} else {
					await runSimpleTransition({
						libs,
						getRefs,
						nextMode,
						reducedMotionActive: reducedMotion,
						setMode: (value) => {
							mode = value
						},
						afterModeChange: async () => tick(),
						setCurrentTimeline
					})
				}
			} else {
				await runRichTransition({
					libs,
					host,
					getRefs,
					fromMode: mode,
					nextMode,
					setMode: (value) => {
						mode = value
					},
					afterModeChange: async () => tick(),
					setCurrentTimeline,
					profileShellPath,
					profileLevel,
					authorName,
					subpageTitle
				})
			}

			transitionSucceeded = true
		} catch {
			resetTransitionStyles(motionLibs, getRefs())
			getRefs().motionLayer?.replaceChildren()
		} finally {
			motionLocked = false
			currentTimeline = null

			if (transitionSucceeded) {
				focusAfterTransition(getRefs(), nextMode)
			}
		}
	}

	export async function transitionTo(nextMode: TopbarMode, origin: TriggerOrigin) {
		void origin
		await requestTransition(nextMode)
	}

	export function toggle(origin: TriggerOrigin) {
		const nextMode = mode === 'subpage' ? 'main' : 'subpage'
		void transitionTo(nextMode, origin)
	}

	onMount(() => {
		void (async () => {
			profileShellPath = await loadProfileShellPath()
			motionLibs = await loadMotionLibs()
		})()

		return () => {
			currentTimeline?.kill()
			currentTimeline = null
			getRefs().motionLayer?.replaceChildren()
			resetTransitionStyles(motionLibs, getRefs())
		}
	})
</script>

{#if mode === 'subpage'}
	<HomeTopbarSubpage
		metrics={subpageMetrics}
		actions={subpageActions}
		title={subpageTitle}
		{motionLocked}
		onBack={() => (onSubpageBack ? onSubpageBack() : toggle('back'))}
		bind:topbarRoot
		bind:backButton
		bind:backGlyph
		bind:titleWrap
		bind:stripShell
	/>
{:else}
	<HomeTopbarMain
		metrics={mainMetrics}
		actions={mainActions}
		{authorName}
		{profileLevel}
		{profileHref}
		bind:topbarRoot
		bind:profileChip
	/>
{/if}

<div
	class="home-topbar-motion-layer"
	id="home-topbar-prototype"
	aria-hidden="true"
	bind:this={motionLayer}
></div>
