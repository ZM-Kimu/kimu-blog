<script lang="ts">
	import { cubicOut } from 'svelte/easing'
	import type { TransitionConfig } from 'svelte/transition'

	function reopenMotion(
		node: Element,
		{ duration = 220 }: { duration?: number } = {}
	): TransitionConfig {
		return {
			duration,
			easing: cubicOut,
			css: (t) => {
				const lift = (1 - t) * -12
				const scale = 0.9 + t * 0.1
				const blur = (1 - t) * 10

				return `
					opacity: ${t};
					transform: translate3d(0, ${lift}px, 0) scale(${scale});
					filter: blur(${blur}px);
				`
			}
		}
	}

	let {
		ariaLabel,
		onActivate
	}: {
		ariaLabel: string
		onActivate: () => void
	} = $props()
</script>

<button
	class="home-topbar-stage__reopen"
	type="button"
	aria-label={ariaLabel}
	onclick={onActivate}
	in:reopenMotion
	out:reopenMotion
>
	<span
		class="home-topbar__icon home-topbar__icon--mask"
		aria-hidden="true"
		style="--topbar-icon-src: url('/icons/topbar/expand.png'); --topbar-icon-tint: #47639c;"
	></span>
</button>
