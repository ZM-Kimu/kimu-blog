import { browser } from '$app/environment'

import type { MusicTrack } from './types'

export type MusicPlayerStatus = 'empty' | 'armed' | 'playing' | 'paused' | 'blocked'

const DEFAULT_VOLUME = 0.35
const VOLUME_STORAGE_KEY = 'kimu-blog.music.volume'

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
		this.#audio.muted = this.muted

		const audio = this.#audio
		const syncTime = () => {
			this.currentTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0
		}
		const syncDuration = () => {
			this.duration = Number.isFinite(audio.duration) ? audio.duration : 0
		}
		const handleEnded = () => {
			this.next({ autoplay: true })
		}
		const handlePause = () => {
			this.playing = false
		}
		const handlePlay = () => {
			this.playing = true
			this.blocked = false
			this.#clearHomeAutoplayRetryListeners()
		}

		audio.addEventListener('timeupdate', syncTime)
		audio.addEventListener('loadedmetadata', syncDuration)
		audio.addEventListener('durationchange', syncDuration)
		audio.addEventListener('ended', handleEnded)
		audio.addEventListener('pause', handlePause)
		audio.addEventListener('play', handlePlay)
		if (this.#homeActive && !this.#manualPause) {
			this.#attemptHomeAutoplay()
		}

		return () => {
			this.#clearHomeAutoplayRetryListeners()
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
		this.#clearHomeAutoplayRetryListeners()
	}

	async play() {
		if (!this.#audio || !this.currentTrack) {
			return
		}

		this.#manualPause = false
		this.#audio.src ||= this.currentTrack.src
		this.blocked = false

		try {
			await this.#audio.play()
			this.playing = true
			this.blocked = false
		} catch {
			this.playing = false
			this.blocked = true
		}
	}

	pause() {
		this.#manualPause = true
		this.#clearHomeAutoplayRetryListeners()
		this.#audio?.pause()
		this.blocked = false
		this.playing = false
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
		this.currentTime = this.#audio.currentTime
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
			this.#audio.muted = this.muted
		}
	}

	toggleMute() {
		this.muted = !this.muted

		if (this.#audio) {
			this.#audio.muted = this.muted
		}
	}

	#selectTrack(nextIndex: number, options: { autoplay?: boolean }) {
		if (!this.#audio || !this.hasTracks) {
			return
		}

		const shouldPlay = options.autoplay ?? this.playing

		if (nextIndex === this.currentIndex) {
			this.#audio.currentTime = 0
			this.currentTime = 0

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

		if (shouldPlay) {
			this.play()
		}
	}

	#attemptHomeAutoplay() {
		if (!this.#homeActive || this.#manualPause || this.playing) {
			return
		}

		this.#armHomeAutoplayRetryListeners()
		window.setTimeout(() => {
			this.#tryHomeAutoplay()
		}, 0)
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
		const retryHomeAutoplayWhenVisible = () => {
			if (document.visibilityState === 'visible') {
				this.#tryHomeAutoplay()
			}
		}

		window.addEventListener('pointerdown', retryHomeAutoplay, {
			capture: true,
			passive: true,
			signal: controller.signal
		})
		window.addEventListener('touchstart', retryHomeAutoplay, {
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
		window.addEventListener('focus', retryHomeAutoplay, {
			capture: true,
			signal: controller.signal
		})
		window.addEventListener('pageshow', retryHomeAutoplay, {
			capture: true,
			signal: controller.signal
		})
		document.addEventListener('visibilitychange', retryHomeAutoplayWhenVisible, {
			signal: controller.signal
		})
		this.#homeAutoplayRetryController = controller
	}

	#clearHomeAutoplayRetryListeners() {
		this.#homeAutoplayRetryController?.abort()
		this.#homeAutoplayRetryController = null
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
	}

	#loadVolumePreference() {
		if (!browser) {
			return
		}

		let rawVolume: string | null
		try {
			rawVolume = window.localStorage.getItem(VOLUME_STORAGE_KEY)
		} catch {
			return
		}

		if (rawVolume === null) {
			return
		}

		const storedVolume = Number(rawVolume)

		if (!Number.isFinite(storedVolume)) {
			return
		}

		this.volume = Math.max(0, Math.min(storedVolume, 1))
		this.muted = this.volume <= 0
	}

	#saveVolumePreference() {
		if (!browser) {
			return
		}

		try {
			window.localStorage.setItem(VOLUME_STORAGE_KEY, String(this.volume))
		} catch {
			// Playback should keep working even when storage is blocked.
		}
	}
}

export function createMusicPlayerController(tracks: readonly MusicTrack[]) {
	return new MusicPlayerController(tracks)
}
