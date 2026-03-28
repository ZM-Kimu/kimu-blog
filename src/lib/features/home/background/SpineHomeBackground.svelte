<script lang="ts">
	import { browser } from '$app/environment'
	import { onMount } from 'svelte'

	import {
		getNextHomeSpineVariantChange,
		homeSpineConfigs,
		resolveHomeSpineVariant,
		type HomeSpineVariant
	} from './home-spine.config'
	import type { BackgroundAnimationStatus } from '$lib/navigation/types'

	let {
		onStatusChange
	}: {
		onStatusChange: (status: BackgroundAnimationStatus) => void
	} = $props()

	let canvas: HTMLCanvasElement | null = $state(null)
	let ready = $state(false)
	let mounted = false
	let variant = $state<HomeSpineVariant>('daytime')

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

	$effect(() => {
		if (!browser || !mounted || !canvas) {
			return
		}

		let disposed = false
		let viewer: { resizeTo: (width: number, height: number) => void; destroy: () => void } | null =
			null
		let observer: ResizeObserver | null = null

		onStatusChange('loading')

		const waitForNextFrame = () =>
			new Promise<void>((resolve) => {
				requestAnimationFrame(() => {
					resolve()
				})
			})

		const applyResize = () => {
			if (!viewer || !canvas) {
				return
			}

			const target = canvas.parentElement ?? canvas
			const rect = target.getBoundingClientRect()
			const width = rect.width || target.clientWidth || window.innerWidth
			const height = rect.height || target.clientHeight || window.innerHeight
			viewer.resizeTo(Math.max(width, 1), Math.max(height, 1))
		}

		void (async () => {
			try {
				const [{ mountBundleOnCanvas }] = await Promise.all([import('./spine-viewer')])

				if (disposed || !canvas) {
					return
				}

				const config = homeSpineConfigs[variant]
				viewer = await mountBundleOnCanvas(canvas, [config.entry], config.options)

				if (disposed) {
					viewer.destroy()
					return
				}

				applyResize()
				observer = new ResizeObserver(() => {
					applyResize()
				})
				observer.observe(canvas.parentElement ?? canvas)

				await waitForNextFrame()
				if (disposed) {
					return
				}
				applyResize()

				await waitForNextFrame()
				if (disposed) {
					return
				}
				applyResize()

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
			observer?.disconnect()
			viewer?.destroy()
		}
	})
</script>

<div class:home-spine-layer--ready={ready} class="home-spine-layer" aria-hidden="true">
	<canvas bind:this={canvas} class="home-spine-layer__canvas"></canvas>
</div>
