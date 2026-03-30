<script lang="ts">
	import { browser } from '$app/environment'
	import { onDestroy, onMount, untrack } from 'svelte'

	import {
		getNextHomeSpineVariantChange,
		homeSpineConfigs,
		resolveHomeSpineVariant,
		type HomeSpineVariant
	} from './home-spine.config'
	import type { BackgroundAnimationStatus } from '$lib/navigation/types'

	let {
		onStatusChange,
		visible = false,
		playing = false
	}: {
		onStatusChange: (status: BackgroundAnimationStatus) => void
		visible?: boolean
		playing?: boolean
	} = $props()

	type SpineViewerHandle = {
		resizeTo: (width: number, height: number) => void
		destroy: () => void
		pausePlayback: () => void
		resumePlayback: () => void
	}

	let canvas: HTMLCanvasElement | null = $state(null)
	let ready = $state(false)
	let mounted = false
	let variant = $state<HomeSpineVariant>('daytime')
	let viewerHandle = $state<SpineViewerHandle | null>(null)
	let resizeObserver: ResizeObserver | null = null
	let resizeObserverTarget: Element | null = null

	function disconnectResizeObserver() {
		resizeObserver?.disconnect()
		resizeObserver = null
		resizeObserverTarget = null
	}

	function applyResizeFor(viewer: SpineViewerHandle | null) {
		if (!viewer || !canvas) {
			return
		}

		const target = canvas.parentElement ?? canvas
		const rect = target.getBoundingClientRect()
		const width = rect.width || target.clientWidth || window.innerWidth
		const height = rect.height || target.clientHeight || window.innerHeight
		viewer.resizeTo(Math.max(width, 1), Math.max(height, 1))
	}

	function applyResize() {
		applyResizeFor(viewerHandle)
	}

	function connectResizeObserverFor(viewer: SpineViewerHandle | null) {
		if (!browser || !canvas || !viewer) {
			disconnectResizeObserver()
			return
		}

		const target = canvas.parentElement ?? canvas
		if (resizeObserver && resizeObserverTarget === target) {
			return
		}

		disconnectResizeObserver()

		resizeObserverTarget = target
		resizeObserver = new ResizeObserver(() => {
			applyResizeFor(viewer)
		})
		resizeObserver.observe(target)
	}

	onMount(() => {
		mounted = true

		let timer: number | null = null

		const syncVariant = () => {
			variant = resolveHomeSpineVariant()
			const nextChangeAt = getNextHomeSpineVariantChange()
			const delay = Math.max(nextChangeAt.getTime() - Date.now(), 1000)
			timer = window.setTimeout(syncVariant, delay)
		}

		syncVariant()

		return () => {
			if (timer) {
				window.clearTimeout(timer)
			}
		}
	})

	onDestroy(() => {
		disconnectResizeObserver()
	})

	$effect(() => {
		if (!browser || !mounted || !canvas) {
			return
		}

		let disposed = false
		let localViewer: SpineViewerHandle | null = null

		onStatusChange('loading')

		const waitForNextFrame = () =>
			new Promise<void>((resolve) => {
				requestAnimationFrame(() => {
					resolve()
				})
			})

		void (async () => {
			try {
				const [{ mountBundleOnCanvas }] = await Promise.all([import('./spine-viewer')])

				if (disposed || !canvas) {
					return
				}

				const config = homeSpineConfigs[variant]
				localViewer = await mountBundleOnCanvas(canvas, [config.entry], config.options)

				if (disposed) {
					localViewer.destroy()
					return
				}

				viewerHandle = localViewer
				applyResizeFor(localViewer)

				if (untrack(() => playing)) {
					localViewer.resumePlayback()
					connectResizeObserverFor(localViewer)
				} else {
					localViewer.pausePlayback()
				}

				await waitForNextFrame()
				if (disposed) {
					return
				}
				if (untrack(() => playing)) {
					applyResizeFor(localViewer)
				}

				await waitForNextFrame()
				if (disposed) {
					return
				}
				if (untrack(() => playing)) {
					applyResizeFor(localViewer)
				}

				ready = true
				onStatusChange('ready')
			} catch (error) {
				console.error('Failed to mount home spine background', error)
				ready = false
				if (!disposed) {
					onStatusChange('failed')
				}
			}
		})()

		return () => {
			disposed = true
			ready = false
			disconnectResizeObserver()
			localViewer?.destroy()
			if (viewerHandle === localViewer) {
				viewerHandle = null
			}
		}
	})

	$effect(() => {
		const viewer = viewerHandle
		if (!viewer) {
			return
		}

		if (playing) {
			viewer.resumePlayback()
			connectResizeObserverFor(viewer)
			requestAnimationFrame(() => {
				applyResize()
			})
			return
		}

		disconnectResizeObserver()
		viewer.pausePlayback()
	})
</script>

<div
	class:home-spine-layer-ready={ready}
	class="home-spine-layer"
	data-visible={visible ? 'true' : 'false'}
	aria-hidden="true"
>
	<canvas bind:this={canvas} class="home-spine-layer-canvas"></canvas>
</div>
