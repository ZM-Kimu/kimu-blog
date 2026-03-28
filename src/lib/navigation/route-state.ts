import type { RouteState } from './types'

export function resolveRouteState({
	pathname,
	status = 200
}: {
	pathname: string
	status?: number
}): RouteState {
	if (status >= 400) {
		return {
			kind: 'error',
			pathname,
			status,
			isError: true
		}
	}

	if (pathname === '/') {
		return {
			kind: 'home',
			pathname,
			status,
			isError: false
		}
	}

	if (pathname === '/blog') {
		return {
			kind: 'blog',
			pathname,
			status,
			isError: false
		}
	}

	if (pathname === '/blog/archive') {
		return {
			kind: 'archive',
			pathname,
			status,
			isError: false
		}
	}

	if (pathname.startsWith('/blog/')) {
		return {
			kind: 'post',
			pathname,
			status,
			isError: false,
			slug: pathname.slice('/blog/'.length)
		}
	}

	if (pathname.startsWith('/tags/')) {
		return {
			kind: 'tag',
			pathname,
			status,
			isError: false,
			tag: pathname.slice('/tags/'.length)
		}
	}

	if (pathname === '/about') {
		return {
			kind: 'about',
			pathname,
			status,
			isError: false
		}
	}

	if (pathname === '/updates') {
		return {
			kind: 'updates',
			pathname,
			status,
			isError: false
		}
	}

	if (pathname === '/favorites') {
		return {
			kind: 'favorites',
			pathname,
			status,
			isError: false
		}
	}

	if (pathname === '/__debug/manage') {
		return {
			kind: 'debugManage',
			pathname,
			status,
			isError: false
		}
	}

	return {
		kind: 'unknown',
		pathname,
		status,
		isError: false
	}
}
