<script lang="ts">
	import { resolve } from '$app/paths'
	import { cubicOut } from 'svelte/easing'
	import { onMount, tick } from 'svelte'
	import { fade } from 'svelte/transition'

	import type { BackgroundAnimationPreference } from '$lib/navigation/types'

	let {
		title,
		closeLabel,
		cursorLabel,
		cursorDescription,
		customLabel,
		systemLabel,
		backgroundAnimationLabel,
		backgroundAnimationDescription,
		backgroundAnimationOnLabel,
		backgroundAnimationOffLabel,
		backgroundAnimationPreference,
		backgroundAnimationDisabled,
		manageLabel,
		manageDescription,
		manageActionLabel,
		cursorMode,
		onClose,
		onSetCursorMode,
		onSetBackgroundAnimationPreference
	}: {
		title: string
		closeLabel: string
		cursorLabel: string
		cursorDescription: string
		customLabel: string
		systemLabel: string
		backgroundAnimationLabel: string
		backgroundAnimationDescription: string
		backgroundAnimationOnLabel: string
		backgroundAnimationOffLabel: string
		backgroundAnimationPreference: BackgroundAnimationPreference
		backgroundAnimationDisabled: boolean
		manageLabel: string
		manageDescription: string
		manageActionLabel: string
		cursorMode: 'custom' | 'system'
		onClose: () => void
		onSetCursorMode: (mode: 'custom' | 'system') => void
		onSetBackgroundAnimationPreference: (mode: BackgroundAnimationPreference) => void
	} = $props()

	let customCursorButton: HTMLButtonElement | null = $state(null)
	let systemCursorButton: HTMLButtonElement | null = $state(null)

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
			;(cursorMode === 'custom' ? customCursorButton : systemCursorButton)?.focus()
		})
	})
</script>

<div class="home-topbar-settings" role="presentation">
	<button
		class="home-topbar-settings-scrim"
		type="button"
		aria-label={closeLabel}
		onclick={onClose}
		in:fade={{ duration: 180 }}
		out:fade={{ duration: 150 }}
	></button>

	<div
		class="home-topbar-settings-panel"
		role="dialog"
		aria-modal="true"
		aria-label={title}
		in:dialogRise
		out:dialogRise={{ duration: 180, y: 10, blur: 8 }}
	>
		<header class="home-topbar-settings-header">
			<div class="home-topbar-settings-heading">
				<strong class="home-topbar-settings-title">{title}</strong>
			</div>
			<button
				class="home-topbar-settings-close"
				type="button"
				aria-label={closeLabel}
				onclick={onClose}
			>
				×
			</button>
		</header>

		<div class="home-topbar-settings-body">
			<div class="home-topbar-settings-options">
				<section class="home-topbar-settings-option">
					<div class="home-topbar-settings-copy">
						<span>{cursorLabel}</span>
						<small>{cursorDescription}</small>
					</div>

					<div
						class="home-topbar-settings-controls home-topbar-settings-controls-switch"
						role="group"
						aria-label={cursorLabel}
						data-cursor-mode={cursorMode}
					>
						<button
							class:active={cursorMode === 'custom'}
							class="home-topbar-settings-choice"
							type="button"
							bind:this={customCursorButton}
							aria-pressed={cursorMode === 'custom'}
							onclick={() => onSetCursorMode('custom')}
						>
							<strong>{customLabel}</strong>
						</button>
						<button
							class:active={cursorMode === 'system'}
							class="home-topbar-settings-choice"
							type="button"
							bind:this={systemCursorButton}
							aria-pressed={cursorMode === 'system'}
							onclick={() => onSetCursorMode('system')}
						>
							<strong>{systemLabel}</strong>
						</button>
					</div>
				</section>

				<section class="home-topbar-settings-option">
					<div class="home-topbar-settings-copy">
						<span>{backgroundAnimationLabel}</span>
						<small>{backgroundAnimationDescription}</small>
					</div>

					<div
						class:home-topbar-settings-controls-disabled={backgroundAnimationDisabled}
						class="home-topbar-settings-controls home-topbar-settings-controls-switch"
						role="group"
						aria-label={backgroundAnimationLabel}
						data-cursor-mode={backgroundAnimationPreference === 'on' ? 'custom' : 'system'}
					>
						<button
							class:active={backgroundAnimationPreference === 'on'}
							class="home-topbar-settings-choice"
							type="button"
							disabled={backgroundAnimationDisabled}
							aria-pressed={backgroundAnimationPreference === 'on'}
							onclick={() => onSetBackgroundAnimationPreference('on')}
						>
							<strong>{backgroundAnimationOnLabel}</strong>
						</button>
						<button
							class:active={backgroundAnimationPreference === 'off'}
							class="home-topbar-settings-choice"
							type="button"
							disabled={backgroundAnimationDisabled}
							aria-pressed={backgroundAnimationPreference === 'off'}
							onclick={() => onSetBackgroundAnimationPreference('off')}
						>
							<strong>{backgroundAnimationOffLabel}</strong>
						</button>
					</div>
				</section>

				<section class="home-topbar-settings-option">
					<div class="home-topbar-settings-copy">
						<span>{manageLabel}</span>
						<small>{manageDescription}</small>
					</div>

					<div class="home-topbar-settings-controls">
						<a class="home-topbar-settings-link-button" href={resolve('/manage')} onclick={onClose}>
							<strong>{manageActionLabel}</strong>
						</a>
					</div>
				</section>
			</div>
		</div>
	</div>
</div>
