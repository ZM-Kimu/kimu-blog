<script lang="ts">
	import { onDestroy } from 'svelte'
	import SpineHomeBackground from '$lib/features/home/background/SpineHomeBackground.svelte'
	import { getNavigationContext } from '$lib/navigation/context'

	import type { BackgroundScene } from '$lib/navigation/types'

	let {
		scene,
		pendingScene = null,
		bridgeActive = false,
		compact = false,
		reducedMotion = false,
		bridgeDurationMs = 180,
		allowWarmup = false
	}: {
		scene: BackgroundScene
		pendingScene?: BackgroundScene | null
		bridgeActive?: boolean
		compact?: boolean
		reducedMotion?: boolean
		bridgeDurationMs?: number
		allowWarmup?: boolean
	} = $props()

	const { navigationManager } = getNavigationContext()

	const showPendingScene = $derived(bridgeActive && pendingScene !== null && pendingScene !== scene)
	const homeSpineAllowed = $derived(
		navigationManager.backgroundAnimationPreference === 'on' &&
			!compact &&
			!reducedMotion &&
			navigationManager.backgroundAnimationStatus !== 'failed'
	)
	const canWarmupHiddenSpine = $derived(
		allowWarmup && navigationManager.phase === 'idle' && !bridgeActive
	)
	const spineOverlayMode = $derived.by(() => {
		if (!spineHostMounted || !homeSpineAllowed) {
			return 'hidden'
		}

		if (scene === 'home-spine') {
			if (pendingScene !== null && pendingScene !== scene) {
				return 'paused-visible'
			}

			return 'live'
		}

		return 'hidden'
	})
	const spineOverlayVisible = $derived(spineOverlayMode !== 'hidden')
	const spineOverlayPlaying = $derived(spineOverlayMode === 'live')
	const spineOverlayLeaving = $derived(spineOverlayMode === 'paused-visible' && bridgeActive)
	let pendingSceneEntering = $state(false)
	let pendingSceneEnterFrame: number | null = null
	let spineHostMounted = $state(false)
	let spineWarmupTimer: number | null = null

	function handleHomeSpineStatus(status: 'idle' | 'loading' | 'ready' | 'failed') {
		navigationManager.setBackgroundAnimationStatus(status)
	}

	function clearPendingSceneEnterFrame() {
		if (pendingSceneEnterFrame === null) {
			return
		}

		cancelAnimationFrame(pendingSceneEnterFrame)
		pendingSceneEnterFrame = null
	}

	function clearSpineWarmupTimer() {
		if (spineWarmupTimer === null) {
			return
		}

		clearTimeout(spineWarmupTimer)
		spineWarmupTimer = null
	}

	onDestroy(() => {
		clearPendingSceneEnterFrame()
		clearSpineWarmupTimer()
	})

	$effect(() => {
		clearPendingSceneEnterFrame()
		pendingSceneEntering = false

		if (!showPendingScene) {
			return
		}

		pendingSceneEnterFrame = requestAnimationFrame(() => {
			pendingSceneEnterFrame = requestAnimationFrame(() => {
				pendingSceneEnterFrame = null
				pendingSceneEntering = true
			})
		})
	})

	$effect(() => {
		clearSpineWarmupTimer()

		if (!homeSpineAllowed) {
			spineHostMounted = false
			return
		}

		if (scene === 'home-spine' || pendingScene === 'home-spine') {
			spineHostMounted = true
			return
		}

		if (spineHostMounted) {
			return
		}

		if (!canWarmupHiddenSpine) {
			return
		}

		spineWarmupTimer = window.setTimeout(() => {
			spineWarmupTimer = null
			spineHostMounted = true
		}, 480)
	})
</script>

{#snippet renderScene(activeScene: BackgroundScene)}
	{#if activeScene === 'home-spine'}
		<div class="background-stage__wash background-stage__wash--home" aria-hidden="true"></div>
		<div class="background-stage__room background-stage__room--home" aria-hidden="true"></div>
		<div class="background-stage__light background-stage__light--home-left" aria-hidden="true"></div>
		<div class="background-stage__light background-stage__light--home-right" aria-hidden="true"></div>
	{:else if activeScene === 'subpage-room'}
		<div class="background-stage__wash background-stage__wash--subpage" aria-hidden="true"></div>
		<div class="background-stage__room background-stage__room--subpage" aria-hidden="true"></div>
		<div
			class="background-stage__light background-stage__light--subpage-left"
			aria-hidden="true"
		></div>
		<div
			class="background-stage__light background-stage__light--subpage-right"
			aria-hidden="true"
		></div>
	{:else}
		<div class="background-stage__wash background-stage__wash--neutral" aria-hidden="true"></div>
		<div class="background-stage__grid" aria-hidden="true"></div>
	{/if}
{/snippet}

<div
	class="background-stage"
	data-bridge-active={bridgeActive ? 'true' : 'false'}
	style={`--background-bridge-duration: ${Math.max(bridgeDurationMs, 0)}ms;`}
	aria-hidden="true"
>
	<div
		class:background-stage__scene--leaving={showPendingScene}
		class="background-stage__scene background-stage__scene--current"
		data-scene={scene}
	>
		{@render renderScene(scene)}
	</div>

	{#if showPendingScene && pendingScene}
		<div
			class:background-stage__scene--entering={pendingSceneEntering}
			class="background-stage__scene background-stage__scene--incoming"
			data-scene={pendingScene}
		>
			{@render renderScene(pendingScene)}
		</div>
	{/if}

	{#if spineHostMounted && homeSpineAllowed}
		<div
			class:background-stage__spine-overlay--visible={spineOverlayVisible}
			class:background-stage__spine-overlay--leaving={spineOverlayLeaving}
			class="background-stage__spine-overlay"
			data-mode={spineOverlayMode}
		>
			<SpineHomeBackground
				onStatusChange={handleHomeSpineStatus}
				visible={spineOverlayVisible}
				playing={spineOverlayPlaying}
			/>
		</div>
	{/if}
</div>

<style>
	.background-stage {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		overflow: clip;
	}

	.background-stage__scene,
	.background-stage__spine-overlay,
	.background-stage__wash,
	.background-stage__room,
	.background-stage__light,
	.background-stage__grid {
		position: absolute;
		inset: 0;
	}

	.background-stage__scene {
		opacity: 0;
		transition: none;
	}

	.background-stage[data-bridge-active='true'] .background-stage__scene {
		transition: opacity var(--background-bridge-duration, 180ms) cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.background-stage__scene--current {
		opacity: 1;
	}

	.background-stage__scene--incoming {
		opacity: 0;
	}

	.background-stage__scene--entering {
		opacity: 1;
	}

	.background-stage__scene--leaving {
		opacity: 0;
	}

	.background-stage__spine-overlay {
		z-index: 1;
		opacity: 0;
		pointer-events: none;
		transition: opacity 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.background-stage__spine-overlay--visible {
		opacity: 1;
	}

	.background-stage[data-bridge-active='true'] .background-stage__spine-overlay--leaving {
		opacity: 0;
		transition-duration: var(--background-bridge-duration, 180ms);
	}

	.background-stage__wash {
		background-size: cover;
	}

	.background-stage__wash--neutral {
		background:
			radial-gradient(circle at top left, rgba(56, 189, 248, 0.22), transparent 28rem),
			radial-gradient(circle at top right, rgba(79, 120, 255, 0.14), transparent 24rem),
			linear-gradient(180deg, #eef8ff 0%, #e8f3ff 45%, #deebfb 100%);
	}

	.background-stage__wash--home {
		background:
			radial-gradient(circle at 18% 14%, rgba(139, 225, 255, 0.28), transparent 22%),
			radial-gradient(circle at 76% 22%, rgba(107, 155, 255, 0.2), transparent 20%),
			radial-gradient(circle at 50% 72%, rgba(255, 255, 255, 0.3), transparent 26%),
			linear-gradient(135deg, rgba(255, 255, 255, 0.66) 0%, rgba(255, 255, 255, 0.08) 42%),
			linear-gradient(180deg, #f7fcff 0%, #e7f4ff 42%, #d3e5fb 100%);
	}

	.background-stage__wash--home::after {
		content: '';
		position: absolute;
		inset: 0;
		background:
			radial-gradient(circle at 32% 34%, rgba(255, 255, 255, 0.5), transparent 14%),
			linear-gradient(110deg, rgba(255, 255, 255, 0.52) 0%, rgba(255, 255, 255, 0) 38%),
			linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0) 28%);
		opacity: 0.92;
	}

	.background-stage__wash--subpage {
		background:
			radial-gradient(circle at top left, rgba(114, 220, 255, 0.18), transparent 28%),
			radial-gradient(circle at 86% 16%, rgba(79, 120, 255, 0.12), transparent 24%),
			linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0) 24%),
			linear-gradient(180deg, #f4fbff 0%, #dff0ff 48%, #d6e7f8 100%);
	}

	.background-stage__wash--subpage::after {
		content: '';
		position: absolute;
		inset: 0;
		background:
			linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.06) 34%),
			linear-gradient(180deg, rgba(255, 255, 255, 0.22), transparent 30%);
	}

	.background-stage__room--home {
		background:
			radial-gradient(circle at 50% 84%, rgba(255, 255, 255, 0.18), transparent 22%),
			linear-gradient(
				180deg,
				rgba(255, 255, 255, 0.04) 0%,
				rgba(193, 232, 255, 0.16) 42%,
				rgba(118, 194, 246, 0.28) 100%
			),
			repeating-linear-gradient(
				90deg,
				rgba(255, 255, 255, 0.2) 0,
				rgba(255, 255, 255, 0.2) 1px,
				transparent 1px,
				transparent 16%
			),
			repeating-linear-gradient(
				180deg,
				rgba(255, 255, 255, 0.14) 0,
				rgba(255, 255, 255, 0.14) 1px,
				transparent 1px,
				transparent 14%
			);
		mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.82) 44%, #000 100%);
		opacity: 0.82;
	}

	.background-stage__room--home::after {
		content: '';
		position: absolute;
		inset: 0;
		background:
			linear-gradient(
				180deg,
				rgba(255, 255, 255, 0) 0%,
				rgba(255, 255, 255, 0.12) 58%,
				rgba(255, 255, 255, 0.2) 100%
			),
			repeating-linear-gradient(
				90deg,
				transparent 0,
				transparent calc(25% - 1px),
				rgba(255, 255, 255, 0.16) calc(25% - 1px),
				rgba(255, 255, 255, 0.16) 25%
			);
		mask-image: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.24) 38%, #000 100%);
		opacity: 0.6;
	}

	.background-stage__room--subpage {
		background:
			linear-gradient(
				180deg,
				rgba(255, 255, 255, 0.04) 0%,
				rgba(187, 228, 249, 0.08) 46%,
				rgba(123, 197, 236, 0.16) 100%
			),
			repeating-linear-gradient(
				90deg,
				rgba(255, 255, 255, 0.3) 0,
				rgba(255, 255, 255, 0.3) 1px,
				transparent 1px,
				transparent 12%
			),
			repeating-linear-gradient(
				180deg,
				rgba(255, 255, 255, 0.16) 0,
				rgba(255, 255, 255, 0.16) 1px,
				transparent 1px,
				transparent 13%
			);
		opacity: 0.6;
	}

	.background-stage__light {
		border-radius: 999px;
		filter: blur(14px);
		opacity: 0.75;
	}

	.background-stage__light--home-left {
		left: 10%;
		top: 9%;
		width: 34%;
		height: 28%;
		background: radial-gradient(circle, rgba(154, 234, 255, 0.92), transparent 72%);
	}

	.background-stage__light--home-right {
		right: 4%;
		top: 14%;
		width: 28%;
		height: 24%;
		background: radial-gradient(circle, rgba(143, 180, 255, 0.42), transparent 74%);
	}

	.background-stage__light--subpage-left {
		left: 20%;
		top: 12%;
		width: 26%;
		height: 24%;
		background: radial-gradient(circle, rgba(139, 225, 255, 0.78), transparent 70%);
	}

	.background-stage__light--subpage-right {
		right: 8%;
		top: 18%;
		width: 24%;
		height: 18%;
		background: radial-gradient(circle, rgba(108, 153, 255, 0.3), transparent 72%);
	}

	.background-stage__grid {
		background:
			linear-gradient(
				90deg,
				rgba(255, 255, 255, 0.08) 0,
				rgba(255, 255, 255, 0.08) 1px,
				transparent 1px,
				transparent 5rem
			),
			linear-gradient(
				rgba(255, 255, 255, 0.08) 0,
				rgba(255, 255, 255, 0.08) 1px,
				transparent 1px,
				transparent 5rem
			);
		mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.22), transparent 60%);
	}

	.background-stage :global(.home-spine-layer) {
		position: absolute;
		inset: 0;
		opacity: 0;
		transition: opacity 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.background-stage :global(.home-spine-layer--ready) {
		opacity: 1;
	}

	.background-stage :global(.home-spine-layer__canvas) {
		display: block;
		width: 100%;
		height: 100%;
		opacity: 0.96;
		filter: saturate(1.04);
	}

	@media (max-width: 760px) {
		.background-stage__room--home,
		.background-stage__room--subpage,
		.background-stage__light--home-left,
		.background-stage__light--home-right,
		.background-stage__light--subpage-left,
		.background-stage__light--subpage-right {
			display: none;
		}
	}
</style>
