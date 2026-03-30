import { getContext, setContext } from 'svelte'

import type { NavigationStateManager } from './navigation-state.svelte'

const NAVIGATION_CONTEXT = Symbol('navigation-context')

export type NavigationContextValue = {
	navigationManager: NavigationStateManager
}

export function setNavigationContext(value: NavigationContextValue) {
	setContext(NAVIGATION_CONTEXT, value)
	return value
}

export function getNavigationContext(): NavigationContextValue {
	const value = getContext<NavigationContextValue>(NAVIGATION_CONTEXT)

	if (!value) {
		throw new Error('Navigation context is not available')
	}

	return value
}
