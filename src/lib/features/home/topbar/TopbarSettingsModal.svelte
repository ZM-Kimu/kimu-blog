<script lang="ts">
	import { resolve } from '$app/paths'
	import { cubicOut } from 'svelte/easing'
	import { onMount, tick } from 'svelte'
	import { fade } from 'svelte/transition'

	let {
		title,
		closeLabel,
		cursorLabel,
		cursorDescription,
		customLabel,
		systemLabel,
		manageLabel,
		manageKicker,
		cursorMode,
		onClose,
		onToggleCursor
	}: {
		title: string
		closeLabel: string
		cursorLabel: string
		cursorDescription: string
		customLabel: string
		systemLabel: string
		manageLabel: string
		manageKicker: string
		cursorMode: 'custom' | 'system'
		onClose: () => void
		onToggleCursor: () => void
	} = $props()

	let cursorToggleButton: HTMLButtonElement | null = $state(null)

	function dialogRise(
		_: Element,
		{
			y = 18,
			blur = 12,
			duration = 260
		}: {
			y?: number
			blur?: number
			duration?: number
		} = {}
	) {
		return {
			duration,
			easing: cubicOut,
			css: (t: number, u: number) =>
				`opacity: ${t}; transform: translate3d(0, ${u * y}px, 0) scale(${0.985 + t * 0.015}); filter: blur(${u * blur}px);`
		}
	}

	onMount(() => {
		void tick().then(() => {
			cursorToggleButton?.focus()
		})
	})
</script>

<div class="home-topbar-settings" role="presentation">
	<button
		class="home-topbar-settings__scrim"
		type="button"
		aria-label={closeLabel}
		onclick={onClose}
		in:fade={{ duration: 180 }}
		out:fade={{ duration: 150 }}
	></button>

	<div
		class="home-topbar-settings__panel"
		role="dialog"
		aria-modal="true"
		aria-label={title}
		in:dialogRise
		out:dialogRise={{ duration: 180, y: 10, blur: 8 }}
	>
		<header class="home-topbar-settings__header">
			<div class="home-topbar-settings__heading">
				<span class="eyebrow">HUD CONFIG</span>
				<strong>{title}</strong>
			</div>
			<button
				class="home-topbar-settings__close"
				type="button"
				aria-label={closeLabel}
				onclick={onClose}
			>
				×
			</button>
		</header>

		<div class="home-topbar-settings__body">
			<div class="home-topbar-settings__group">
				<div class="home-topbar-settings__copy">
					<span>{cursorLabel}</span>
					<small>{cursorDescription}</small>
				</div>
				<button
					class="home-topbar-settings__toggle"
					type="button"
					bind:this={cursorToggleButton}
					onclick={onToggleCursor}
				>
					<strong>{cursorMode === 'custom' ? customLabel : systemLabel}</strong>
				</button>
			</div>

			<a class="home-topbar-settings__manage" href={resolve('/manage')} onclick={onClose}>
				<span class="home-topbar-settings__manage-kicker">{manageKicker}</span>
				<strong>{manageLabel}</strong>
			</a>
		</div>
	</div>
</div>
