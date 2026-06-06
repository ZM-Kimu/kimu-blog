import { getContext, setContext } from 'svelte'

import type { MusicPlayerController } from './music-player.svelte'

const MUSIC_PLAYER_CONTEXT = Symbol('music-player-context')

export type MusicPlayerContextValue = {
	musicPlayer: MusicPlayerController
}

export function setMusicPlayerContext(value: MusicPlayerContextValue) {
	setContext(MUSIC_PLAYER_CONTEXT, value)
	return value
}

export function getMusicPlayerContext(): MusicPlayerContextValue {
	const value = getContext<MusicPlayerContextValue>(MUSIC_PLAYER_CONTEXT)

	if (!value) {
		throw new Error('Music player context is not available')
	}

	return value
}
