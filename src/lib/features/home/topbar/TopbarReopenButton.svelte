<script lang="ts">
	import { cubicOut } from 'svelte/easing'
	import type { TransitionConfig } from 'svelte/transition'
	import { getMotionTokens } from '$lib/motion/tokens'
	import { createTopbarIconStyle } from './home-topbar.dom'

	function reopenMotion(
		node: Element,
		{
			duration = topbarMotion.reopenTransitionDurationMs,
			offsetY = topbarMotion.reopenOffsetYPx,
			blur = topbarMotion.reopenBlurPx,
			scaleFrom = topbarMotion.reopenScaleFrom
		}: {
			duration?: number
			offsetY?: number
			blur?: number
			scaleFrom?: number
		} = {}
	): TransitionConfig {
		return {
			duration,
			easing: cubicOut,
			css: (t) => {
				const lift = (1 - t) * offsetY
				const scale = scaleFrom + t * (1 - scaleFrom)
				const activeBlur = (1 - t) * blur

				return `
					opacity: ${t};
					transform: translate3d(0, ${lift}px, 0) scale(${scale});
					filter: blur(${activeBlur}px);
				`
			}
		}
	}

	let {
		ariaLabel,
		reducedMotion = false,
		onActivate
	}: {
		ariaLabel: string
		reducedMotion?: boolean
		onActivate: () => void
	} = $props()

	const topbarMotion = $derived(getMotionTokens({ portrait: false, reducedMotion }).topbar)
	const reopenIconStyle = createTopbarIconStyle({
		src: '/icons/topbar/expand.png',
		tint: '#47639c'
	})
</script>

<button
	class="home-topbar-stage-reopen"
	type="button"
	aria-label={ariaLabel}
	onclick={onActivate}
	in:reopenMotion
	out:reopenMotion
>
	<span class="home-topbar-icon home-topbar-icon-mask" aria-hidden="true" style={reopenIconStyle}
	></span>
</button>
