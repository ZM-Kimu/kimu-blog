<script lang="ts">
	import { onDestroy, onMount } from 'svelte'

	import { translate, type LocaleMessages } from '$lib/i18n'
	import { getMusicPlayerContext } from '$lib/music/context'
	import { getNavigationContext } from '$lib/navigation/context'

	type VolumePanelState = 'closed' | 'opening' | 'open' | 'closing'
	type SiteBootPhase = 'boot' | 'entry' | 'idle'

	let { messages }: { messages?: LocaleMessages } = $props()

	const { musicPlayer } = getMusicPlayerContext()
	const { navigationManager } = getNavigationContext()
	const currentTrack = $derived(musicPlayer.currentTrack)
	const currentTitle = $derived(currentTrack?.title ?? t('home.music.emptyTitle'))
	const toggleLabel = $derived(musicPlayer.playing ? t('home.music.pause') : t('home.music.play'))
	const progressStyle = $derived(`--home-mini-player-progress: ${musicPlayer.progress};`)
	const volumeStyle = $derived(
		`--home-mini-player-progress: ${musicPlayer.muted ? 0 : musicPlayer.volume};`
	)
	const volumeText = $derived(`${Math.round(musicPlayer.volume * 100)}%`)
	const volumeToggleLabel = $derived(
		musicPlayer.muted ? t('home.music.unmute') : t('home.music.mute')
	)
	let volumePanelState = $state<VolumePanelState>('closed')
	const volumePanelOpen = $derived(volumePanelState === 'opening' || volumePanelState === 'open')
	const volumeControlClass = $derived(
		volumePanelState === 'opening' || volumePanelState === 'open'
			? 'home-mini-player-volume-control home-mini-player-volume-control-open'
			: volumePanelState === 'closing'
				? 'home-mini-player-volume-control home-mini-player-volume-control-closing'
				: 'home-mini-player-volume-control'
	)
	const volumePopoverClass = $derived(
		volumePanelState === 'open'
			? 'home-mini-player-volume-popover home-mini-player-volume-popover-open'
			: volumePanelState === 'opening'
				? 'home-mini-player-volume-popover'
				: volumePanelState === 'closing'
					? 'home-mini-player-volume-popover home-mini-player-volume-popover-closing'
					: 'home-mini-player-volume-popover'
	)
	const volumePopoverVisible = $derived(
		volumePanelState === 'opening' || volumePanelState === 'open' || volumePanelState === 'closing'
	)
	let volumePanelProgress = $state(0)
	let siteBootPhase = $state<SiteBootPhase>('boot')
	let homeMusicActivated = false
	const volumePopoverStyle = $derived(
		volumePopoverVisible
			? [
					'visibility: visible',
					`opacity: ${volumePanelProgress}`,
					`pointer-events: ${volumePanelState === 'closing' ? 'none' : 'auto'}`,
					`filter: blur(${(1 - volumePanelProgress) * 4}px)`,
					`transform: translate(50%, ${(1 - volumePanelProgress) * 0.36}rem) scale(${0.97 + volumePanelProgress * 0.03})`
				].join('; ')
			: undefined
	)
	let volumePanelOpenFrame: number | undefined
	let volumePanelAnimationFrame: number | undefined
	let siteBootObserver: MutationObserver | undefined

	function t(key: string, params?: Record<string, string | number>) {
		return translate(messages, key, params)
	}

	function formatTime(value: number) {
		if (!Number.isFinite(value) || value <= 0) {
			return '0:00'
		}

		const minutes = Math.floor(value / 60)
		const seconds = Math.floor(value % 60)
		return `${minutes}:${seconds.toString().padStart(2, '0')}`
	}

	function handleSeek(event: Event) {
		const input = event.currentTarget as HTMLInputElement
		musicPlayer.seek(Number(input.value))
	}

	function handleVolume(event: Event) {
		const input = event.currentTarget as HTMLInputElement
		musicPlayer.setVolume(Number(input.value))
	}

	function clearVolumePanelOpenFrame() {
		if (volumePanelOpenFrame !== undefined) {
			window.cancelAnimationFrame(volumePanelOpenFrame)
			volumePanelOpenFrame = undefined
		}
	}

	function clearVolumePanelAnimationFrame() {
		if (volumePanelAnimationFrame !== undefined) {
			window.cancelAnimationFrame(volumePanelAnimationFrame)
			volumePanelAnimationFrame = undefined
		}
	}

	function clearVolumePanelTimers() {
		clearVolumePanelOpenFrame()
		clearVolumePanelAnimationFrame()
	}

	function syncSiteBootPhase() {
		const nextPhase = document.documentElement.dataset.siteBootPhase
		siteBootPhase = nextPhase === 'entry' || nextPhase === 'idle' ? nextPhase : 'boot'
	}

	function getVolumePanelDurationMs() {
		const rawDuration = window
			.getComputedStyle(document.documentElement)
			.getPropertyValue('--motion-home-music-volume-duration')
			.trim()

		if (rawDuration.endsWith('ms')) {
			return Number.parseFloat(rawDuration)
		}

		if (rawDuration.endsWith('s')) {
			return Number.parseFloat(rawDuration) * 1000
		}

		return 220
	}

	function easeVolumePanel(value: number) {
		return 1 - (1 - value) ** 3
	}

	function animateVolumePanel(targetProgress: number, finalState: VolumePanelState) {
		clearVolumePanelAnimationFrame()

		const initialProgress = volumePanelProgress
		const distance = targetProgress - initialProgress
		const duration = getVolumePanelDurationMs()

		if (duration <= 1 || Math.abs(distance) < 0.001) {
			volumePanelProgress = targetProgress
			volumePanelState = finalState
			return
		}

		const startedAt = window.performance.now()
		const tick = (now: number) => {
			const elapsed = Math.min(1, (now - startedAt) / duration)
			volumePanelProgress = initialProgress + distance * easeVolumePanel(elapsed)

			if (elapsed < 1) {
				volumePanelAnimationFrame = window.requestAnimationFrame(tick)
				return
			}

			volumePanelAnimationFrame = undefined
			volumePanelProgress = targetProgress
			volumePanelState = finalState
		}

		volumePanelAnimationFrame = window.requestAnimationFrame(tick)
	}

	function openVolumePanel() {
		if (volumePanelState === 'open' || volumePanelState === 'opening') {
			return
		}

		clearVolumePanelTimers()
		volumePanelState = 'opening'
		volumePanelOpenFrame = window.requestAnimationFrame(() => {
			volumePanelOpenFrame = undefined

			if (volumePanelState === 'opening') {
				animateVolumePanel(1, 'open')
			}
		})
	}

	function closeVolumePanel() {
		if (volumePanelState === 'closed' || volumePanelState === 'closing') {
			return
		}

		clearVolumePanelTimers()
		volumePanelState = 'closing'
		animateVolumePanel(0, 'closed')
	}

	function handleVolumeFocusOut(event: FocusEvent) {
		const nextTarget = event.relatedTarget
		const currentTarget = event.currentTarget as HTMLElement

		if (nextTarget instanceof Node && currentTarget.contains(nextTarget)) {
			return
		}

		closeVolumePanel()
	}

	onDestroy(() => {
		clearVolumePanelTimers()
		siteBootObserver?.disconnect()

		if (homeMusicActivated) {
			musicPlayer.deactivateHome()
		}
	})

	onMount(() => {
		syncSiteBootPhase()
		siteBootObserver = new MutationObserver(syncSiteBootPhase)
		siteBootObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-site-boot-phase']
		})
	})

	$effect(() => {
		if (homeMusicActivated || siteBootPhase !== 'idle' || navigationManager.phase !== 'idle') {
			return
		}

		homeMusicActivated = true
		musicPlayer.activateHome()
	})
</script>

<section class="home-mini-player" aria-label={t('a11y.home.musicPlayer')}>
	<strong class="home-mini-player-title" aria-live="polite">{currentTitle}</strong>

	<div class="home-mini-player-controls">
		<button
			aria-label={t('home.music.previous')}
			class="home-mini-player-control"
			disabled={!musicPlayer.hasTracks}
			onclick={() => musicPlayer.previous()}
			type="button"
		>
			<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
				<path d="M7 5h2v14H7V5Zm3.5 7 8.5 7V5l-8.5 7Z" />
			</svg>
		</button>

		<button
			aria-label={toggleLabel}
			class="home-mini-player-control home-mini-player-toggle"
			disabled={!musicPlayer.hasTracks}
			onclick={() => musicPlayer.toggle()}
			type="button"
		>
			{#if musicPlayer.playing}
				<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
					<path d="M7 5h3.5v14H7V5Zm6.5 0H17v14h-3.5V5Z" />
				</svg>
			{:else}
				<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
					<path d="M8 5.25v13.5L18.5 12 8 5.25Z" />
				</svg>
			{/if}
		</button>

		<button
			aria-label={t('home.music.next')}
			class="home-mini-player-control"
			disabled={!musicPlayer.hasTracks}
			onclick={() => musicPlayer.next({ autoplay: musicPlayer.playing })}
			type="button"
		>
			<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
				<path d="M15 5h2v14h-2V5ZM5 19l8.5-7L5 5v14Z" />
			</svg>
		</button>
	</div>

	<div class="home-mini-player-progress-row" style={progressStyle}>
		<span>{formatTime(musicPlayer.currentTime)}</span>
		<label class="home-mini-player-range-shell">
			<span class="home-mini-player-range-visual" aria-hidden="true">
				<span class="home-mini-player-range-fill"></span>
				<span class="home-mini-player-range-thumb"></span>
			</span>
			<input
				aria-label={t('home.music.progress')}
				class="home-mini-player-range-input"
				disabled={musicPlayer.duration <= 0}
				max={musicPlayer.duration || 0}
				min="0"
				oninput={handleSeek}
				step="1"
				type="range"
				value={musicPlayer.currentTime}
			/>
		</label>
		<span>{formatTime(musicPlayer.duration)}</span>

		<div
			aria-label={t('home.music.volume')}
			class={volumeControlClass}
			role="group"
			style={volumeStyle}
			onfocusin={openVolumePanel}
			onfocusout={handleVolumeFocusOut}
			onpointerenter={openVolumePanel}
			onpointerleave={closeVolumePanel}
		>
			<button
				aria-label={volumeToggleLabel}
				aria-expanded={volumePanelOpen}
				aria-pressed={musicPlayer.muted}
				class="home-mini-player-volume-button"
				type="button"
				onclick={() => musicPlayer.toggleMute()}
			>
				{#if musicPlayer.muted || musicPlayer.volume <= 0}
					<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
						<path
							d="M4 9.2h3.05L12 5.25v13.5L7.05 14.8H4V9.2Zm11.05.3 1.1-1.1 1.95 1.95 1.95-1.95 1.1 1.1-1.95 1.95 1.95 1.95-1.1 1.1-1.95-1.95-1.95 1.95-1.1-1.1L17 11.45 15.05 9.5Z"
						/>
					</svg>
				{:else}
					<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
						<path
							d="M4 9.2h3.05L12 5.25v13.5L7.05 14.8H4V9.2Zm10.4-.75 1.1-1.1A6.5 6.5 0 0 1 17.35 12a6.5 6.5 0 0 1-1.85 4.65l-1.1-1.1A4.94 4.94 0 0 0 15.8 12a4.94 4.94 0 0 0-1.4-3.55Zm2.35-2.35 1.08-1.08A9.84 9.84 0 0 1 20.65 12a9.84 9.84 0 0 1-2.82 6.98l-1.08-1.08A8.3 8.3 0 0 0 19.1 12a8.3 8.3 0 0 0-2.35-5.9Z"
						/>
					</svg>
				{/if}
			</button>

			{#if volumePopoverVisible}
				<div class={volumePopoverClass} style={volumePopoverStyle}>
					<span class="home-mini-player-volume-percent">{volumeText}</span>
					<label class="home-mini-player-volume-range">
						<span class="home-mini-player-range-visual" aria-hidden="true">
							<span class="home-mini-player-range-fill"></span>
							<span class="home-mini-player-range-thumb"></span>
						</span>
						<input
							aria-label={t('home.music.volume')}
							class="home-mini-player-range-input"
							max="1"
							min="0"
							oninput={handleVolume}
							step="0.01"
							type="range"
							value={musicPlayer.volume}
						/>
					</label>
				</div>
			{/if}
		</div>
	</div>
</section>
