import { getContext, setContext } from 'svelte'

export type PublicLayoutMode = 'landscape' | 'portrait'

const PUBLIC_LAYOUT_CONTEXT = Symbol('public-layout-context')

export type PublicLayoutContextValue = {
	getMode: () => PublicLayoutMode
}

export function setPublicLayoutContext(value: PublicLayoutContextValue) {
	setContext(PUBLIC_LAYOUT_CONTEXT, value)
	return value
}

export function getPublicLayoutContext(): PublicLayoutContextValue {
	const value = getContext<PublicLayoutContextValue>(PUBLIC_LAYOUT_CONTEXT)

	if (!value) {
		throw new Error('Public layout context is not available')
	}

	return value
}
