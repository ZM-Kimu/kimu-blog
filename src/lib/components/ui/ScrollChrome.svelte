<script lang="ts">
	import { browser } from '$app/environment'
	import { createEventDispatcher, type Snippet } from 'svelte'
	import { onDestroy, onMount } from 'svelte'

	type ScrollAxis = 'x' | 'y' | 'both'
	type ScrollChromeScrollDetail = {
		scrollTop: number
		scrollLeft: number
	}
	type ScrollChromeWheelIntentDetail = {
		deltaX: number
		deltaY: number
		scrollTop: number
		scrollLeft: number
		hasXOverflow: boolean
		hasYOverflow: boolean
	}

	let {
		axis = 'y',
		class: className = '',
		viewportClass = '',
		children
	}: {
		axis?: ScrollAxis
		class?: string
		viewportClass?: string
		children: Snippet
	} = $props()

	let viewport: HTMLDivElement | null = $state(null)
	let trackY: HTMLDivElement | null = $state(null)
	let trackX: HTMLDivElement | null = $state(null)

	let hasYOverflow = $state(false)
	let hasXOverflow = $state(false)
	let yThumbSize = $state(0)
	let yThumbOffset = $state(0)
	let xThumbSize = $state(0)
	let xThumbOffset = $state(0)

	let rafId = 0
	let releasePointerListeners: (() => void) | null = null

	const minThumbSizePx = 28
	const dispatch = createEventDispatcher<{
		scroll: ScrollChromeScrollDetail
		wheelintent: ScrollChromeWheelIntentDetail
	}>()
	const usesYAxis = $derived(axis === 'y' || axis === 'both')
	const usesXAxis = $derived(axis === 'x' || axis === 'both')
	const chromeStyle = $derived.by(
		() =>
			`--scroll-chrome-thumb-y-size: ${yThumbSize}px; --scroll-chrome-thumb-y-offset: ${yThumbOffset}px; --scroll-chrome-thumb-x-size: ${xThumbSize}px; --scroll-chrome-thumb-x-offset: ${xThumbOffset}px;`
	)

	function clamp(value: number, min: number, max: number) {
		return Math.min(Math.max(value, min), max)
	}

	function scheduleUpdate() {
		if (!browser) {
			return
		}

		window.cancelAnimationFrame(rafId)
		rafId = window.requestAnimationFrame(() => {
			rafId = 0
			updateMetrics()
		})
	}

	function updateMetrics() {
		if (!viewport) {
			hasYOverflow = false
			hasXOverflow = false
			return
		}

		if (usesYAxis && trackY) {
			const scrollRange = viewport.scrollHeight - viewport.clientHeight
			const trackLength = trackY.clientHeight
			hasYOverflow = scrollRange > 1 && trackLength > 0

			if (hasYOverflow) {
				const nextThumbSize = clamp(
					(viewport.clientHeight / viewport.scrollHeight) * trackLength,
					minThumbSizePx,
					trackLength
				)
				const thumbTravel = Math.max(trackLength - nextThumbSize, 0)
				yThumbSize = nextThumbSize
				yThumbOffset = scrollRange <= 0 ? 0 : (viewport.scrollTop / scrollRange) * thumbTravel
			} else {
				yThumbSize = 0
				yThumbOffset = 0
			}
		} else {
			hasYOverflow = false
			yThumbSize = 0
			yThumbOffset = 0
		}

		if (usesXAxis && trackX) {
			const scrollRange = viewport.scrollWidth - viewport.clientWidth
			const trackLength = trackX.clientWidth
			hasXOverflow = scrollRange > 1 && trackLength > 0

			if (hasXOverflow) {
				const nextThumbSize = clamp(
					(viewport.clientWidth / viewport.scrollWidth) * trackLength,
					minThumbSizePx,
					trackLength
				)
				const thumbTravel = Math.max(trackLength - nextThumbSize, 0)
				xThumbSize = nextThumbSize
				xThumbOffset = scrollRange <= 0 ? 0 : (viewport.scrollLeft / scrollRange) * thumbTravel
			} else {
				xThumbSize = 0
				xThumbOffset = 0
			}
		} else {
			hasXOverflow = false
			xThumbSize = 0
			xThumbOffset = 0
		}
	}

	function startDrag(axisName: 'x' | 'y', event: PointerEvent) {
		if (!viewport) {
			return
		}

		const isVertical = axisName === 'y'
		const track = isVertical ? trackY : trackX
		if (!track) {
			return
		}

		const scrollRange = isVertical
			? viewport.scrollHeight - viewport.clientHeight
			: viewport.scrollWidth - viewport.clientWidth
		const trackLength = isVertical ? track.clientHeight : track.clientWidth
		const thumbSize = isVertical ? yThumbSize : xThumbSize
		const thumbTravel = Math.max(trackLength - thumbSize, 0)
		const pointerStart = isVertical ? event.clientY : event.clientX
		const scrollStart = isVertical ? viewport.scrollTop : viewport.scrollLeft

		const handlePointerMove = (moveEvent: PointerEvent) => {
			if (!viewport) {
				return
			}

			const pointerValue = isVertical ? moveEvent.clientY : moveEvent.clientX
			const delta = pointerValue - pointerStart
			const progress = thumbTravel <= 0 ? 0 : delta / thumbTravel
			const nextScroll = clamp(scrollStart + progress * scrollRange, 0, scrollRange)

			if (isVertical) {
				viewport.scrollTop = nextScroll
			} else {
				viewport.scrollLeft = nextScroll
			}

			updateMetrics()
		}

		const stopDrag = () => {
			window.removeEventListener('pointermove', handlePointerMove)
			window.removeEventListener('pointerup', stopDrag)
			window.removeEventListener('pointercancel', stopDrag)
			releasePointerListeners = null
		}

		window.addEventListener('pointermove', handlePointerMove)
		window.addEventListener('pointerup', stopDrag)
		window.addEventListener('pointercancel', stopDrag)
		releasePointerListeners = stopDrag
	}

	function jumpTrack(axisName: 'x' | 'y', event: PointerEvent) {
		if (!viewport) {
			return
		}

		const isVertical = axisName === 'y'
		const track = isVertical ? trackY : trackX
		if (!track) {
			return
		}

		const trackRect = track.getBoundingClientRect()
		const trackLength = isVertical ? trackRect.height : trackRect.width
		const thumbSize = isVertical ? yThumbSize : xThumbSize
		const scrollRange = isVertical
			? viewport.scrollHeight - viewport.clientHeight
			: viewport.scrollWidth - viewport.clientWidth
		const pointerValue = isVertical ? event.clientY - trackRect.top : event.clientX - trackRect.left
		const thumbTravel = Math.max(trackLength - thumbSize, 0)
		const nextOffset = clamp(pointerValue - thumbSize / 2, 0, thumbTravel)
		const nextProgress = thumbTravel <= 0 ? 0 : nextOffset / thumbTravel

		if (isVertical) {
			viewport.scrollTop = nextProgress * scrollRange
		} else {
			viewport.scrollLeft = nextProgress * scrollRange
		}

		updateMetrics()
	}

	function handleTrackPointerDown(axisName: 'x' | 'y', event: PointerEvent) {
		const target = event.target
		if (!(target instanceof Element) || target.closest('.scroll-chrome-thumb')) {
			return
		}

		jumpTrack(axisName, event)
	}

	onMount(() => {
		if (!browser || !viewport) {
			return
		}

		scheduleUpdate()

		const resizeObserver = new ResizeObserver(() => {
			scheduleUpdate()
		})
		const mutationObserver = new MutationObserver(() => {
			scheduleUpdate()
		})
		const handleScroll = () => {
			updateMetrics()
			dispatch('scroll', {
				scrollTop: viewport?.scrollTop ?? 0,
				scrollLeft: viewport?.scrollLeft ?? 0
			})
		}
		const handleWheel = (event: WheelEvent) => {
			dispatch('wheelintent', {
				deltaX: event.deltaX,
				deltaY: event.deltaY,
				scrollTop: viewport?.scrollTop ?? 0,
				scrollLeft: viewport?.scrollLeft ?? 0,
				hasXOverflow,
				hasYOverflow
			})
		}
		const handleContentLoad = () => {
			scheduleUpdate()
		}

		resizeObserver.observe(viewport)
		if (trackY) {
			resizeObserver.observe(trackY)
		}
		if (trackX) {
			resizeObserver.observe(trackX)
		}
		mutationObserver.observe(viewport, {
			childList: true,
			subtree: true,
			characterData: true
		})
		viewport.addEventListener('scroll', handleScroll, { passive: true })
		viewport.addEventListener('wheel', handleWheel, { passive: true })
		viewport.addEventListener('load', handleContentLoad, true)
		void document.fonts?.ready.then(() => {
			scheduleUpdate()
		})

		return () => {
			window.cancelAnimationFrame(rafId)
			releasePointerListeners?.()
			resizeObserver.disconnect()
			mutationObserver.disconnect()
			viewport?.removeEventListener('scroll', handleScroll)
			viewport?.removeEventListener('wheel', handleWheel)
			viewport?.removeEventListener('load', handleContentLoad, true)
		}
	})

	onDestroy(() => {
		if (browser) {
			window.cancelAnimationFrame(rafId)
		}
		releasePointerListeners?.()
	})
</script>

<div
	class={`scroll-chrome ${className}`.trim()}
	data-scroll-axis={axis}
	data-has-y-scroll={hasYOverflow}
	data-has-x-scroll={hasXOverflow}
	style={chromeStyle}
>
	<div
		bind:this={viewport}
		class={`scroll-chrome-viewport ${viewportClass}`.trim()}
		data-scroll-chrome-viewport="true"
	>
		{@render children()}
	</div>

	{#if usesYAxis}
		<div
			bind:this={trackY}
			class="scroll-chrome-track scroll-chrome-track-y"
			data-visible={hasYOverflow}
			aria-hidden="true"
			onpointerdown={(event) => handleTrackPointerDown('y', event)}
		>
			<div
				class="scroll-chrome-thumb scroll-chrome-thumb-y"
				role="presentation"
				aria-hidden="true"
				onpointerdown={(event) => startDrag('y', event)}
			></div>
		</div>
	{/if}

	{#if usesXAxis}
		<div
			bind:this={trackX}
			class="scroll-chrome-track scroll-chrome-track-x"
			data-visible={hasXOverflow}
			aria-hidden="true"
			onpointerdown={(event) => handleTrackPointerDown('x', event)}
		>
			<div
				class="scroll-chrome-thumb scroll-chrome-thumb-x"
				role="presentation"
				aria-hidden="true"
				onpointerdown={(event) => startDrag('x', event)}
			></div>
		</div>
	{/if}
</div>

<style>
	.scroll-chrome {
		--scroll-chrome-inset: 0.125rem;
		--scroll-chrome-size: 0.44rem;
		--scroll-chrome-thumb-y-size: 0px;
		--scroll-chrome-thumb-y-offset: 0px;
		--scroll-chrome-thumb-x-size: 0px;
		--scroll-chrome-thumb-x-offset: 0px;

		position: relative;
		inline-size: 100%;
		min-height: 0;
	}

	.scroll-chrome-viewport {
		min-height: 0;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.scroll-chrome-viewport::-webkit-scrollbar {
		display: none;
		width: 0;
		height: 0;
	}

	.scroll-chrome-track {
		position: absolute;
		z-index: 2;
		cursor: inherit;
		user-select: none;
		touch-action: none;
		opacity: 0;
		transition: opacity var(--motion-shared-ease-standard);
	}

	.scroll-chrome-track[data-visible='true'] {
		opacity: 1;
	}

	.scroll-chrome-track::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 999px;
		background: rgb(76 133 214 / 10%);
	}

	.scroll-chrome-track-y {
		inset-block: var(--scroll-chrome-inset);
		inset-inline-end: var(--scroll-chrome-inset);
		inline-size: var(--scroll-chrome-size);
	}

	.scroll-chrome-track-x {
		inset-inline: var(--scroll-chrome-inset);
		inset-block-end: var(--scroll-chrome-inset);
		block-size: var(--scroll-chrome-size);
	}

	.scroll-chrome-thumb {
		position: absolute;
		border-radius: 999px;
		background: linear-gradient(180deg, rgb(114 175 255 / 68%), rgb(54 111 184 / 62%));
		box-shadow:
			inset 0 1px 0 rgb(255 255 255 / 28%),
			0 6px 18px rgb(31 92 153 / 16%);
		cursor: inherit;
	}

	.scroll-chrome-thumb-y {
		inset-inline: 0;
		block-size: var(--scroll-chrome-thumb-y-size);
		transform: translateY(var(--scroll-chrome-thumb-y-offset));
	}

	.scroll-chrome-thumb-x {
		inset-block: 0;
		inline-size: var(--scroll-chrome-thumb-x-size);
		transform: translateX(var(--scroll-chrome-thumb-x-offset));
	}
</style>
