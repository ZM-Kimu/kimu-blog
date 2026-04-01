import type {
	ManageApiErrorPayload,
	ManagePostDocument,
	ManagePostListResponse,
	ManagePostWritePayload,
	ManagePostWriteResponse,
	ManageSessionResponse
} from '$lib/features/manage/types'

export class ManageApiError extends Error {
	code: string
	details: unknown
	rawMessage: string | null
	status: number

	constructor(
		status: number,
		code: string,
		rawMessage: string | null = null,
		details: unknown = null
	) {
		super(code)
		this.name = 'ManageApiError'
		this.status = status
		this.code = code
		this.rawMessage = rawMessage
		this.details = details
	}
}

async function parseManageJson<T>(response: Response): Promise<T> {
	const payload = (await response.json().catch(() => null)) as T | ManageApiErrorPayload | null

	if (!response.ok) {
		const errorPayload = payload as ManageApiErrorPayload | null
		const code = errorPayload?.error?.code ?? 'manage_request_failed'
		const message = errorPayload?.error?.message ?? null
		throw new ManageApiError(response.status, code, message, errorPayload?.error?.details ?? null)
	}

	return payload as T
}

function buildManageWriteFormData(payload: ManagePostWritePayload, files: File[]) {
	const formData = new FormData()
	formData.append('payload', JSON.stringify(payload))

	for (const file of files) {
		formData.append('files[]', file, file.name)
	}

	return formData
}

export async function fetchManageSession(fetchImpl: typeof fetch) {
	return parseManageJson<ManageSessionResponse>(await fetchImpl('/api/manage/session'))
}

export async function fetchManagedPostList(fetchImpl: typeof fetch) {
	return parseManageJson<ManagePostListResponse>(await fetchImpl('/api/manage/posts'))
}

export async function fetchManagedPost(fetchImpl: typeof fetch, slug: string) {
	return parseManageJson<ManagePostDocument>(
		await fetchImpl(`/api/manage/posts/${encodeURIComponent(slug)}`)
	)
}

export async function createManagedPostRequest(
	fetchImpl: typeof fetch,
	csrfToken: string,
	payload: ManagePostWritePayload,
	files: File[]
) {
	return parseManageJson<ManagePostWriteResponse>(
		await fetchImpl('/api/manage/posts', {
			body: buildManageWriteFormData(payload, files),
			headers: {
				'x-manage-csrf': csrfToken
			},
			method: 'POST'
		})
	)
}

export async function updateManagedPostRequest(
	fetchImpl: typeof fetch,
	csrfToken: string,
	slug: string,
	payload: ManagePostWritePayload,
	files: File[]
) {
	return parseManageJson<ManagePostWriteResponse>(
		await fetchImpl(`/api/manage/posts/${encodeURIComponent(slug)}`, {
			body: buildManageWriteFormData(payload, files),
			headers: {
				'x-manage-csrf': csrfToken
			},
			method: 'PUT'
		})
	)
}

export async function deleteManagedPostRequest(
	fetchImpl: typeof fetch,
	csrfToken: string,
	slug: string,
	expectedSha: string
) {
	return parseManageJson<ManagePostWriteResponse>(
		await fetchImpl(`/api/manage/posts/${encodeURIComponent(slug)}`, {
			body: JSON.stringify({ expectedSha }),
			headers: {
				'content-type': 'application/json',
				'x-manage-csrf': csrfToken
			},
			method: 'DELETE'
		})
	)
}
