import type { BackgroundAnimationPreference } from './types'

const CURSOR_MODE_STORAGE_KEY = 'cursor-mode'
const BACKGROUND_ANIMATION_STORAGE_KEY = 'home-background-animation'

export function readStoredCursorMode(storage: Storage) {
	const savedCursorMode = storage.getItem(CURSOR_MODE_STORAGE_KEY)
	return savedCursorMode === 'custom' || savedCursorMode === 'system' ? savedCursorMode : null
}

export function persistCursorMode(storage: Storage, mode: 'custom' | 'system') {
	storage.setItem(CURSOR_MODE_STORAGE_KEY, mode)
}

export function readStoredBackgroundAnimationPreference(storage: Storage) {
	const savedPreference = storage.getItem(BACKGROUND_ANIMATION_STORAGE_KEY)
	return savedPreference === 'on' || savedPreference === 'off' ? savedPreference : null
}

export function persistBackgroundAnimationPreference(
	storage: Storage,
	mode: BackgroundAnimationPreference
) {
	storage.setItem(BACKGROUND_ANIMATION_STORAGE_KEY, mode)
}
