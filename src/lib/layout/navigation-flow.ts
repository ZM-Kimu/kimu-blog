import type { LocaleMessages } from '$lib/i18n'
import { createPageState } from '$lib/navigation/page-state'
import { resolveRouteState } from '$lib/navigation/route-state'

export function resolvePreviewRouteState(pathname: string) {
	const previewStatus =
		pathname === '/__debug/error-404' ? 404 : pathname === '/__debug/error-500' ? 500 : 200
	const previewRouteState = resolveRouteState({
		pathname,
		status: previewStatus
	})

	if (previewRouteState.kind !== 'unknown') {
		return previewRouteState
	}

	return resolveRouteState({
		pathname,
		status: 404
	})
}

export function createPreviewPageState(args: {
	pathname: string
	data: Record<string, unknown>
	messages?: LocaleMessages
}) {
	const routeState = resolvePreviewRouteState(args.pathname)
	const pageState = createPageState({
		routeState,
		data: args.data,
		messages: args.messages
	})

	return { routeState, pageState }
}

export function wait(durationMs: number) {
	if (durationMs <= 0) {
		return Promise.resolve()
	}

	return new Promise<void>((resolvePromise) => {
		setTimeout(resolvePromise, durationMs)
	})
}

export function waitForNextPaint() {
	return new Promise<void>((resolvePromise) => {
		requestAnimationFrame(() => resolvePromise())
	})
}
