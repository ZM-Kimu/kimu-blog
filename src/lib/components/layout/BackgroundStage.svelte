<script lang="ts">
	import { onDestroy } from 'svelte'
	import SpineHomeBackground from '$lib/features/home/background/SpineHomeBackground.svelte'
	import { getNavigationContext } from '$lib/navigation/context'

	import type { BackgroundScene } from '$lib/navigation/types'

	let {
		scene,
		pendingScene = null,
		bridgeActive = false,
		layoutMode = 'landscape',
		reducedMotion = false,
		bridgeDurationMs = 0,
		allowWarmup = false
	}: {
		scene: BackgroundScene
		pendingScene?: BackgroundScene | null
		bridgeActive?: boolean
		layoutMode?: 'landscape' | 'portrait'
		reducedMotion?: boolean
		bridgeDurationMs?: number
		allowWarmup?: boolean
	} = $props()

	const { navigationManager } = getNavigationContext()

	const isPortraitLayout = $derived(layoutMode === 'portrait')
	const showPendingScene = $derived(bridgeActive && pendingScene !== null && pendingScene !== scene)
	const homeSpineAllowed = $derived(
		navigationManager.backgroundAnimationPreference === 'on' &&
			!isPortraitLayout &&
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
	{#if isPortraitLayout}
		{#if activeScene === 'home-spine'}
			<div
				class="background-stage-wash background-stage-wash-portrait-home"
				aria-hidden="true"
			></div>
		{:else if activeScene === 'subpage-room'}
			<div
				class="background-stage-wash background-stage-wash-portrait-subpage"
				aria-hidden="true"
			></div>
		{:else}
			<div
				class="background-stage-wash background-stage-wash-portrait-neutral"
				aria-hidden="true"
			></div>
		{/if}
	{:else if activeScene === 'home-spine'}
		<div class="background-stage-wash background-stage-wash-home" aria-hidden="true"></div>
		<div class="background-stage-room background-stage-room-home" aria-hidden="true"></div>
		<div class="background-stage-light background-stage-light-home-left" aria-hidden="true"></div>
		<div class="background-stage-light background-stage-light-home-right" aria-hidden="true"></div>
	{:else if activeScene === 'subpage-room'}
		<div class="background-stage-wash background-stage-wash-subpage" aria-hidden="true"></div>
		<div class="background-stage-room background-stage-room-subpage" aria-hidden="true"></div>
		<div
			class="background-stage-light background-stage-light-subpage-left"
			aria-hidden="true"
		></div>
		<div
			class="background-stage-light background-stage-light-subpage-right"
			aria-hidden="true"
		></div>
	{:else}
		<div class="background-stage-wash background-stage-wash-neutral" aria-hidden="true"></div>
		<div class="background-stage-grid" aria-hidden="true"></div>
	{/if}
{/snippet}

<div
	class="background-stage"
	data-bridge-active={bridgeActive ? 'true' : 'false'}
	style={`--motion-bg-bridge-duration: ${Math.max(bridgeDurationMs, 0)}ms;`}
	aria-hidden="true"
>
	<div
		class:background-stage-scene-leaving={showPendingScene}
		class="background-stage-scene background-stage-scene-current"
		data-scene={scene}
	>
		{@render renderScene(scene)}
	</div>

	{#if showPendingScene && pendingScene && !isPortraitLayout}
		<div
			class:background-stage-scene-entering={pendingSceneEntering}
			class="background-stage-scene background-stage-scene-incoming"
			data-scene={pendingScene}
		>
			{@render renderScene(pendingScene)}
		</div>
	{/if}

	{#if spineHostMounted && homeSpineAllowed}
		<div
			class:background-stage-spine-overlay-visible={spineOverlayVisible}
			class:background-stage-spine-overlay-leaving={spineOverlayLeaving}
			class="background-stage-spine-overlay"
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

	.background-stage-scene,
	.background-stage-spine-overlay,
	.background-stage-wash,
	.background-stage-room,
	.background-stage-light,
	.background-stage-grid {
		position: absolute;
		inset: 0;
	}

	.background-stage-scene {
		opacity: 0;
		transition: none;
	}

	.background-stage[data-bridge-active='true'] .background-stage-scene {
		transition: opacity var(--motion-bg-bridge-duration) var(--motion-shared-easing-standard);
	}

	.background-stage-scene-current {
		opacity: 1;
	}

	.background-stage-scene-incoming {
		opacity: 0;
	}

	.background-stage-scene-entering {
		opacity: 1;
	}

	.background-stage-scene-leaving {
		opacity: 0;
	}

	.background-stage-spine-overlay {
		z-index: 1;
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--motion-bg-spine-fade-duration) var(--motion-shared-easing-standard);
	}

	.background-stage-spine-overlay-visible {
		opacity: 1;
	}

	.background-stage[data-bridge-active='true'] .background-stage-spine-overlay-leaving {
		opacity: 0;
		transition-duration: var(--motion-bg-bridge-duration);
	}

	.background-stage-wash {
		background-size: cover;
	}

	.background-stage-wash-neutral {
		background:
			radial-gradient(circle at top left, rgb(56 189 248 / 22%), transparent 28rem),
			radial-gradient(circle at top right, rgb(79 120 255 / 14%), transparent 24rem),
			linear-gradient(180deg, #eef8ff 0%, #e8f3ff 45%, #deebfb 100%);
	}

	.background-stage-wash-portrait-home {
		background:
			radial-gradient(circle at 14% 8%, rgb(154 234 255 / 24%), transparent 22%),
			radial-gradient(circle at 86% 12%, rgb(79 120 255 / 14%), transparent 24%),
			radial-gradient(circle at 50% 100%, rgb(255 255 255 / 52%), transparent 36%),
			linear-gradient(180deg, rgb(252 253 255 / 99%), rgb(242 248 255 / 96%) 44%, #def 100%);
	}

	.background-stage-wash-portrait-subpage {
		background:
			radial-gradient(circle at 10% 12%, rgb(139 225 255 / 12%), transparent 22%),
			radial-gradient(circle at 88% 18%, rgb(79 120 255 / 9%), transparent 20%),
			linear-gradient(180deg, rgb(250 252 255 / 98%), rgb(244 248 255 / 96%) 46%, #e7effa 100%);
	}

	.background-stage-wash-portrait-neutral {
		background:
			radial-gradient(circle at top right, rgb(255 255 255 / 48%), transparent 26%),
			linear-gradient(180deg, #f6f9ff 0%, #ecf3fb 100%);
	}

	.background-stage-wash-home {
		background:
			radial-gradient(circle at 18% 14%, rgb(139 225 255 / 28%), transparent 22%),
			radial-gradient(circle at 76% 22%, rgb(107 155 255 / 20%), transparent 20%),
			radial-gradient(circle at 50% 72%, rgb(255 255 255 / 30%), transparent 26%),
			linear-gradient(135deg, rgb(255 255 255 / 66%) 0%, rgb(255 255 255 / 8%) 42%),
			linear-gradient(180deg, #f7fcff 0%, #e7f4ff 42%, #d3e5fb 100%);
	}

	.background-stage-wash-home::after {
		content: '';
		position: absolute;
		inset: 0;
		background:
			radial-gradient(circle at 32% 34%, rgb(255 255 255 / 50%), transparent 14%),
			linear-gradient(110deg, rgb(255 255 255 / 52%) 0%, rgb(255 255 255 / 0%) 38%),
			linear-gradient(180deg, rgb(255 255 255 / 18%), rgb(255 255 255 / 0%) 28%);
		opacity: 0.92;
	}

	.background-stage-wash-subpage {
		background:
			radial-gradient(circle at top left, rgb(114 220 255 / 18%), transparent 28%),
			radial-gradient(circle at 86% 16%, rgb(79 120 255 / 12%), transparent 24%),
			linear-gradient(180deg, rgb(255 255 255 / 12%), rgb(255 255 255 / 0%) 24%),
			linear-gradient(180deg, #f4fbff 0%, #dff0ff 48%, #d6e7f8 100%);
	}

	.background-stage-wash-subpage::after {
		content: '';
		position: absolute;
		inset: 0;
		background:
			linear-gradient(135deg, rgb(255 255 255 / 92%) 0%, rgb(255 255 255 / 6%) 34%),
			linear-gradient(180deg, rgb(255 255 255 / 22%), transparent 30%);
	}

	.background-stage-room-home {
		background:
			radial-gradient(circle at 50% 84%, rgb(255 255 255 / 18%), transparent 22%),
			linear-gradient(
				180deg,
				rgb(255 255 255 / 4%) 0%,
				rgb(193 232 255 / 16%) 42%,
				rgb(118 194 246 / 28%) 100%
			),
			repeating-linear-gradient(
				90deg,
				rgb(255 255 255 / 20%) 0,
				rgb(255 255 255 / 20%) 1px,
				transparent 1px,
				transparent 16%
			),
			repeating-linear-gradient(
				180deg,
				rgb(255 255 255 / 14%) 0,
				rgb(255 255 255 / 14%) 1px,
				transparent 1px,
				transparent 14%
			);
		mask-image: linear-gradient(180deg, rgb(0 0 0 / 20%), rgb(0 0 0 / 82%) 44%, #000 100%);
		opacity: 0.82;
	}

	.background-stage-room-home::after {
		content: '';
		position: absolute;
		inset: 0;
		background:
			linear-gradient(
				180deg,
				rgb(255 255 255 / 0%) 0%,
				rgb(255 255 255 / 12%) 58%,
				rgb(255 255 255 / 20%) 100%
			),
			repeating-linear-gradient(
				90deg,
				transparent 0,
				transparent calc(25% - 1px),
				rgb(255 255 255 / 16%) calc(25% - 1px),
				rgb(255 255 255 / 16%) 25%
			);
		mask-image: linear-gradient(180deg, transparent 0%, rgb(0 0 0 / 24%) 38%, #000 100%);
		opacity: 0.6;
	}

	.background-stage-room-subpage {
		background:
			linear-gradient(
				180deg,
				rgb(255 255 255 / 4%) 0%,
				rgb(187 228 249 / 8%) 46%,
				rgb(123 197 236 / 16%) 100%
			),
			repeating-linear-gradient(
				90deg,
				rgb(255 255 255 / 30%) 0,
				rgb(255 255 255 / 30%) 1px,
				transparent 1px,
				transparent 12%
			),
			repeating-linear-gradient(
				180deg,
				rgb(255 255 255 / 16%) 0,
				rgb(255 255 255 / 16%) 1px,
				transparent 1px,
				transparent 13%
			);
		opacity: 0.6;
	}

	.background-stage-light {
		border-radius: 999px;
		filter: blur(14px);
		opacity: 0.75;
	}

	.background-stage-light-home-left {
		left: 10%;
		top: 9%;
		width: 34%;
		height: 28%;
		background: radial-gradient(circle, rgb(154 234 255 / 92%), transparent 72%);
	}

	.background-stage-light-home-right {
		right: 4%;
		top: 14%;
		width: 28%;
		height: 24%;
		background: radial-gradient(circle, rgb(143 180 255 / 42%), transparent 74%);
	}

	.background-stage-light-subpage-left {
		left: 20%;
		top: 12%;
		width: 26%;
		height: 24%;
		background: radial-gradient(circle, rgb(139 225 255 / 78%), transparent 70%);
	}

	.background-stage-light-subpage-right {
		right: 8%;
		top: 18%;
		width: 24%;
		height: 18%;
		background: radial-gradient(circle, rgb(108 153 255 / 30%), transparent 72%);
	}

	.background-stage-grid {
		background:
			linear-gradient(
				90deg,
				rgb(255 255 255 / 8%) 0,
				rgb(255 255 255 / 8%) 1px,
				transparent 1px,
				transparent 5rem
			),
			linear-gradient(
				rgb(255 255 255 / 8%) 0,
				rgb(255 255 255 / 8%) 1px,
				transparent 1px,
				transparent 5rem
			);
		mask-image: linear-gradient(180deg, rgb(0 0 0 / 22%), transparent 60%);
	}

	@media (width <= 760px) {
		.background-stage-room-home,
		.background-stage-room-subpage,
		.background-stage-light-home-left,
		.background-stage-light-home-right,
		.background-stage-light-subpage-left,
		.background-stage-light-subpage-right {
			display: none;
		}
	}
</style>
