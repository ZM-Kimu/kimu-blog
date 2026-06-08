import { browser } from '$app/environment'

import type { MusicTrack } from './types'

export type MusicPlayerStatus = 'empty' | 'armed' | 'playing' | 'paused' | 'blocked'

const DEFAULT_VOLUME = 0.35
const VOLUME_STORAGE_KEY = 'kimu-blog.music.volume'
const MUTED_STORAGE_KEY = 'kimu-blog.music.muted'
const MEDIA_SESSION_SEEK_STEP_SECONDS = 10
const MEDIA_SESSION_ACTIONS = [
	'play',
	'pause',
	'previoustrack',
	'nexttrack',
	'seekbackward',
	'seekforward',
	'seekto',
	'stop'
] as const satisfies readonly MediaSessionAction[]

type MediaSessionHandler = Parameters<MediaSession['setActionHandler']>[1]
type MediaSessionWithPosition = MediaSession & {
	setPositionState?: (state?: MediaPositionState) => void
}

export class MusicPlayerController {
	readonly tracks: readonly MusicTrack[]

	currentIndex = $state(0)
	currentTime = $state(0)
	duration = $state(0)
	volume = $state(DEFAULT_VOLUME)
	muted = $state(false)
	playing = $state(false)
	armed = $state(false)
	blocked = $state(false)

	#audio: HTMLAudioElement | null = null
	#manualPause = false
	#homeActive = false
	#initialTrackSelected = false
	#homeAutoplayRetryController: AbortController | null = null
	#homeAutoplayAttemptPending = false
	#progressAnimationFrame: number | null = null
	#mediaSessionActive = false

	constructor(tracks: readonly MusicTrack[]) {
		this.tracks = tracks
	}

	get hasTracks() {
		return this.tracks.length > 0
	}

	get currentTrack() {
		return this.tracks[this.currentIndex] ?? null
	}

	get status(): MusicPlayerStatus {
		if (!this.hasTracks) {
			return 'empty'
		}

		if (this.playing) {
			return 'playing'
		}

		if (this.blocked) {
			return 'blocked'
		}

		if (this.#manualPause) {
			return 'paused'
		}

		return 'armed'
	}

	get progress() {
		return this.duration > 0 ? Math.min(1, this.currentTime / this.duration) : 0
	}

	mount() {
		if (!browser || !this.hasTracks) {
			return () => {}
		}

		this.armed = true
		this.#loadVolumePreference()
		this.#audio = new Audio()
		this.#audio.preload = 'metadata'
		this.#audio.src = this.currentTrack?.src ?? ''
		this.#audio.volume = this.volume
		this.#syncAudioMuted()

		const audio = this.#audio
		const syncTime = () => {
			this.#syncCurrentTime({ mediaSession: true })
		}
		const syncDuration = () => {
			this.duration = Number.isFinite(audio.duration) ? audio.duration : 0
			this.#syncMediaSessionPosition()
		}
		const handleEnded = () => {
			this.next({ autoplay: true })
		}
		const handlePause = () => {
			this.playing = false
			this.#stopProgressClock()
			this.#syncMediaSessionPlaybackState()
		}
		const handlePlay = () => {
			this.playing = true
			this.blocked = false
			this.#startProgressClock()
			this.#clearHomeAutoplayRetries()
			this.#syncMediaSessionPlaybackState()
		}

		audio.addEventListener('timeupdate', syncTime)
		audio.addEventListener('loadedmetadata', syncDuration)
		audio.addEventListener('durationchange', syncDuration)
		audio.addEventListener('ended', handleEnded)
		audio.addEventListener('pause', handlePause)
		audio.addEventListener('play', handlePlay)
		this.#setupMediaSession()
		if (this.#homeActive && !this.#manualPause) {
			this.#attemptHomeAutoplay()
		}

		return () => {
			this.#clearHomeAutoplayRetries()
			this.#stopProgressClock()
			this.#clearMediaSession()
			audio.removeEventListener('timeupdate', syncTime)
			audio.removeEventListener('loadedmetadata', syncDuration)
			audio.removeEventListener('durationchange', syncDuration)
			audio.removeEventListener('ended', handleEnded)
			audio.removeEventListener('pause', handlePause)
			audio.removeEventListener('play', handlePlay)
			audio.pause()
			audio.removeAttribute('src')
			audio.load()
			this.#audio = null
			this.playing = false
			this.armed = false
			this.#homeActive = false
		}
	}

	activateHome() {
		this.#homeActive = true

		if (!this.hasTracks) {
			return
		}

		const wasPlaying = this.playing

		if (!this.#initialTrackSelected) {
			this.#selectRandomTrack({ autoplay: wasPlaying })
			this.#initialTrackSelected = true
		}

		if (!this.#manualPause && !wasPlaying) {
			this.#attemptHomeAutoplay()
		}
	}

	deactivateHome() {
		this.#homeActive = false
		this.#clearHomeAutoplayRetries()
	}

	async play() {
		if (!this.#audio || !this.currentTrack) {
			return
		}

		this.#manualPause = false
		this.#audio.src ||= this.currentTrack.src
		this.#syncAudioMuted()
		this.blocked = false

		try {
			await this.#audio.play()
			this.playing = true
			this.blocked = false
			this.#startProgressClock()
		} catch {
			this.playing = false
			this.blocked = true
			this.#stopProgressClock()
		} finally {
			this.#syncMediaSessionPlaybackState()
		}
	}

	pause() {
		this.#manualPause = true
		this.#clearHomeAutoplayRetries()
		this.#audio?.pause()
		this.blocked = false
		this.playing = false
		this.#stopProgressClock()
		this.#syncMediaSessionPlaybackState()
	}

	toggle() {
		if (this.playing) {
			this.pause()
			return
		}

		this.play()
	}

	next(options: { autoplay?: boolean } = {}) {
		if (!this.hasTracks) {
			return
		}

		this.#selectTrack((this.currentIndex + 1) % this.tracks.length, options)
	}

	previous() {
		if (!this.hasTracks) {
			return
		}

		const nextIndex = (this.currentIndex - 1 + this.tracks.length) % this.tracks.length
		this.#selectTrack(nextIndex, { autoplay: this.playing })
	}

	seek(nextTime: number) {
		if (!this.#audio || !Number.isFinite(nextTime)) {
			return
		}

		this.#audio.currentTime = Math.max(0, Math.min(nextTime, this.duration || nextTime))
		this.#syncCurrentTime({ mediaSession: true })
	}

	setVolume(nextVolume: number) {
		if (!Number.isFinite(nextVolume)) {
			return
		}

		this.volume = Math.max(0, Math.min(nextVolume, 1))
		this.muted = this.volume <= 0
		this.#saveVolumePreference()

		if (this.#audio) {
			this.#audio.volume = this.volume
			this.#syncAudioMuted()
		}
	}

	toggleMute() {
		this.muted = !this.muted
		this.#saveVolumePreference()

		this.#syncAudioMuted()
	}

	#selectTrack(nextIndex: number, options: { autoplay?: boolean }) {
		if (!this.#audio || !this.hasTracks) {
			return
		}

		const shouldPlay = options.autoplay ?? this.playing

		if (nextIndex === this.currentIndex) {
			this.#audio.currentTime = 0
			this.currentTime = 0
			this.#syncMediaSessionPosition()

			if (shouldPlay) {
				this.play()
			}

			return
		}

		this.currentIndex = nextIndex
		this.currentTime = 0
		this.duration = 0
		this.#audio.src = this.currentTrack?.src ?? ''
		this.#audio.load()
		this.#syncMediaSessionMetadata()
		this.#syncMediaSessionPosition()

		if (shouldPlay) {
			this.play()
		}
	}

	#attemptHomeAutoplay() {
		if (!this.#homeActive || this.#manualPause || this.playing) {
			return
		}

		this.#armHomeAutoplayRetryListeners()
		this.#tryHomeAutoplay()
	}

	#tryHomeAutoplay() {
		if (
			!this.#audio ||
			!this.#homeActive ||
			this.#manualPause ||
			this.playing ||
			this.#homeAutoplayAttemptPending
		) {
			return
		}

		this.#homeAutoplayAttemptPending = true
		void this.play().finally(() => {
			this.#homeAutoplayAttemptPending = false

			if (this.#homeActive && !this.#manualPause && !this.playing) {
				this.#armHomeAutoplayRetryListeners()
			}
		})
	}

	#armHomeAutoplayRetryListeners() {
		if (!browser || this.#homeAutoplayRetryController) {
			return
		}

		const controller = new AbortController()
		const retryHomeAutoplay = () => {
			this.#tryHomeAutoplay()
		}

		window.addEventListener('pointerdown', retryHomeAutoplay, {
			capture: true,
			passive: true,
			signal: controller.signal
		})
		window.addEventListener('pointerup', retryHomeAutoplay, {
			capture: true,
			passive: true,
			signal: controller.signal
		})
		window.addEventListener('mousedown', retryHomeAutoplay, {
			capture: true,
			passive: true,
			signal: controller.signal
		})
		window.addEventListener('mouseup', retryHomeAutoplay, {
			capture: true,
			passive: true,
			signal: controller.signal
		})
		window.addEventListener('touchstart', retryHomeAutoplay, {
			capture: true,
			passive: true,
			signal: controller.signal
		})
		window.addEventListener('touchend', retryHomeAutoplay, {
			capture: true,
			passive: true,
			signal: controller.signal
		})
		window.addEventListener('click', retryHomeAutoplay, {
			capture: true,
			passive: true,
			signal: controller.signal
		})
		window.addEventListener('keydown', retryHomeAutoplay, {
			capture: true,
			signal: controller.signal
		})
		window.addEventListener('keyup', retryHomeAutoplay, {
			capture: true,
			signal: controller.signal
		})
		this.#homeAutoplayRetryController = controller
	}

	#clearHomeAutoplayRetryListeners() {
		this.#homeAutoplayRetryController?.abort()
		this.#homeAutoplayRetryController = null
	}

	#clearHomeAutoplayRetries() {
		this.#clearHomeAutoplayRetryListeners()
	}

	#selectRandomTrack(options: { autoplay?: boolean } = {}) {
		if (!this.hasTracks) {
			return
		}

		const nextIndex =
			this.tracks.length > 1
				? (this.currentIndex + 1 + Math.floor(Math.random() * (this.tracks.length - 1))) %
					this.tracks.length
				: 0

		if (this.#audio) {
			this.#selectTrack(nextIndex, options)
			return
		}

		this.currentIndex = nextIndex
		this.currentTime = 0
		this.duration = 0
		this.#syncMediaSessionMetadata()
		this.#syncMediaSessionPosition()
	}

	#setupMediaSession() {
		if (!this.#canUseMediaSession()) {
			return
		}

		this.#setMediaSessionActionHandler('play', () => {
			void this.play()
		})
		this.#setMediaSessionActionHandler('pause', () => {
			this.pause()
		})
		this.#setMediaSessionActionHandler('previoustrack', () => {
			this.previous()
		})
		this.#setMediaSessionActionHandler('nexttrack', () => {
			this.next({ autoplay: this.playing })
		})
		this.#setMediaSessionActionHandler('seekbackward', (details) => {
			this.seek(this.currentTime - (details.seekOffset ?? MEDIA_SESSION_SEEK_STEP_SECONDS))
		})
		this.#setMediaSessionActionHandler('seekforward', (details) => {
			this.seek(this.currentTime + (details.seekOffset ?? MEDIA_SESSION_SEEK_STEP_SECONDS))
		})
		this.#setMediaSessionActionHandler('seekto', (details) => {
			if (typeof details.seekTime === 'number') {
				this.seek(details.seekTime)
			}
		})
		this.#setMediaSessionActionHandler('stop', () => {
			this.pause()
			this.seek(0)
		})

		this.#mediaSessionActive = true
		this.#syncMediaSessionMetadata()
		this.#syncMediaSessionPlaybackState()
		this.#syncMediaSessionPosition()
	}

	#clearMediaSession() {
		if (!this.#canUseMediaSession() || !this.#mediaSessionActive) {
			return
		}

		for (const action of MEDIA_SESSION_ACTIONS) {
			this.#setMediaSessionActionHandler(action, null)
		}

		try {
			navigator.mediaSession.metadata = null
			navigator.mediaSession.playbackState = 'none'
		} catch {
			// Some browsers expose a partial Media Session implementation.
		}

		this.#mediaSessionActive = false
	}

	#canUseMediaSession() {
		return browser && typeof navigator !== 'undefined' && 'mediaSession' in navigator
	}

	#setMediaSessionActionHandler(action: MediaSessionAction, handler: MediaSessionHandler) {
		if (!this.#canUseMediaSession()) {
			return
		}

		try {
			navigator.mediaSession.setActionHandler(action, handler)
		} catch {
			// Unsupported actions should not prevent the supported media controls from working.
		}
	}

	#syncMediaSessionMetadata() {
		if (!this.#canUseMediaSession() || typeof MediaMetadata === 'undefined') {
			return
		}

		try {
			navigator.mediaSession.metadata = this.currentTrack
				? new MediaMetadata({
						title: this.currentTrack.title,
						artist: 'Kimu Blog'
					})
				: null
		} catch {
			// Metadata is progressive enhancement; playback remains the source of truth.
		}
	}

	#syncMediaSessionPlaybackState() {
		if (!this.#canUseMediaSession()) {
			return
		}

		try {
			navigator.mediaSession.playbackState = this.playing
				? 'playing'
				: this.hasTracks
					? 'paused'
					: 'none'
		} catch {
			// Partial implementations may reject playbackState writes.
		}
	}

	#syncMediaSessionPosition() {
		if (!this.#canUseMediaSession() || this.duration <= 0) {
			return
		}

		const session = navigator.mediaSession as MediaSessionWithPosition
		const position = Math.max(0, Math.min(this.currentTime, this.duration))

		try {
			session.setPositionState?.({
				duration: this.duration,
				playbackRate: 1,
				position
			})
		} catch {
			// Position state is optional and can be rejected for partially loaded media.
		}
	}

	#syncCurrentTime(options: { mediaSession?: boolean } = {}) {
		if (!this.#audio) {
			return
		}

		this.currentTime = Number.isFinite(this.#audio.currentTime) ? this.#audio.currentTime : 0

		if (options.mediaSession) {
			this.#syncMediaSessionPosition()
		}
	}

	#startProgressClock() {
		if (!browser || this.#progressAnimationFrame !== null) {
			return
		}

		const tick = () => {
			if (!this.#audio || !this.playing) {
				this.#progressAnimationFrame = null
				return
			}

			this.#syncCurrentTime()
			this.#progressAnimationFrame = window.requestAnimationFrame(tick)
		}

		this.#progressAnimationFrame = window.requestAnimationFrame(tick)
	}

	#stopProgressClock() {
		if (this.#progressAnimationFrame !== null) {
			window.cancelAnimationFrame(this.#progressAnimationFrame)
			this.#progressAnimationFrame = null
		}

		this.#syncCurrentTime({ mediaSession: true })
	}

	#syncAudioMuted() {
		if (this.#audio) {
			this.#audio.muted = this.muted
		}
	}

	#loadVolumePreference() {
		if (!browser) {
			return
		}

		let rawVolume: string | null
		let rawMuted: string | null
		try {
			rawVolume = window.localStorage.getItem(VOLUME_STORAGE_KEY)
			rawMuted = window.localStorage.getItem(MUTED_STORAGE_KEY)
		} catch {
			return
		}

		if (rawVolume !== null) {
			const storedVolume = Number(rawVolume)

			if (Number.isFinite(storedVolume)) {
				this.volume = Math.max(0, Math.min(storedVolume, 1))
			}
		}

		if (rawMuted !== null) {
			this.muted = rawMuted === 'true'
			return
		}

		this.muted = this.volume <= 0
	}

	#saveVolumePreference() {
		if (!browser) {
			return
		}

		try {
			window.localStorage.setItem(VOLUME_STORAGE_KEY, String(this.volume))
			window.localStorage.setItem(MUTED_STORAGE_KEY, String(this.muted))
		} catch {
			// Playback should keep working even when storage is blocked.
		}
	}
}

export function createMusicPlayerController(tracks: readonly MusicTrack[]) {
	return new MusicPlayerController(tracks)
}
