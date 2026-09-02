<script lang="ts">
	import { browser } from '$app/environment'
	import { onDestroy } from 'svelte'

	type ClickFxInstance = {
		dispose: () => void
	}

	let { enabled = true } = $props<{
		enabled?: boolean
	}>()

	let host: HTMLDivElement | null = $state(null)
	let instance: ClickFxInstance | null = null
	let mountToken = 0

	function disposeInstance() {
		instance?.dispose()
		instance = null
	}

	async function ensureInstance() {
		if (!browser || !enabled || !host || instance) {
			return
		}

		const token = ++mountToken
		const { createTouchEffect } = await import('blue-archive-touch-effect')
		if (token !== mountToken || !enabled || !host || instance) {
			return
		}

		instance = createTouchEffect({
			target: host,
			listenTarget: window,
			pixelRatioCap: 1.5,
			config: {
				swipe: {
					input: {
						pointerCapture: false
					}
				}
			}
		})
	}

	$effect(() => {
		if (!browser) {
			return
		}

		if (enabled) {
			void ensureInstance()
			return
		}

		mountToken += 1
		disposeInstance()
	})

	onDestroy(() => {
		mountToken += 1
		disposeInstance()
	})
</script>

<div aria-hidden="true" bind:this={host} class="site-click-effect-layer"></div>
