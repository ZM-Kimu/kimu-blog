import type { Cookies } from '@sveltejs/kit';

import { ManageError } from '$lib/server/manage/errors';

const MANAGE_CSRF_COOKIE = 'manage_csrf';
const TOKEN_BYTES = 32;

function bytesToHex(bytes: Uint8Array) {
	return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
}

function isValidCsrfToken(value: string | undefined): value is string {
	return typeof value === 'string' && /^[a-f0-9]{64}$/u.test(value);
}

function shouldUseSecureCookie(url: URL) {
	return url.protocol === 'https:';
}

export function getOrCreateManageCsrfToken(cookies: Cookies, url: URL) {
	const existing = cookies.get(MANAGE_CSRF_COOKIE);

	if (isValidCsrfToken(existing)) {
		return existing;
	}

	const token = bytesToHex(crypto.getRandomValues(new Uint8Array(TOKEN_BYTES)));

	cookies.set(MANAGE_CSRF_COOKIE, token, {
		httpOnly: true,
		maxAge: 60 * 60 * 8,
		path: '/api/manage',
		sameSite: 'strict',
		secure: shouldUseSecureCookie(url)
	});

	return token;
}

export function assertManageWriteRequestProtection(event: {
	cookies: Cookies;
	request: Request;
	url: URL;
}) {
	const { cookies, request, url } = event;
	const method = request.method.toUpperCase();

	if (!['DELETE', 'PATCH', 'POST', 'PUT'].includes(method)) {
		return;
	}

	const origin = request.headers.get('origin');
	const secFetchSite = request.headers.get('sec-fetch-site');
	const hasServiceToken =
		request.headers.has('cf-access-client-id') && request.headers.has('cf-access-client-secret');

	if (!origin) {
		if (hasServiceToken) {
			return;
		}

		throw new ManageError(403, 'csrf_required', '缺少浏览器来源校验或 service token');
	}

	if (origin !== url.origin) {
		throw new ManageError(403, 'invalid_origin', 'Origin 校验失败');
	}

	if (secFetchSite && secFetchSite !== 'same-origin') {
		throw new ManageError(403, 'invalid_fetch_site', 'Sec-Fetch-Site 必须为 same-origin');
	}

	const csrfHeader = request.headers.get('x-manage-csrf');
	const csrfCookie = cookies.get(MANAGE_CSRF_COOKIE);

	if (!isValidCsrfToken(csrfCookie) || csrfHeader !== csrfCookie) {
		throw new ManageError(403, 'invalid_csrf', 'CSRF 校验失败');
	}
}
