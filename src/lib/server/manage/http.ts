import { json } from '@sveltejs/kit'
import { z } from 'zod'

import { postFrontmatterSchema } from '$lib/content/schema'
import { ManageError, isManageError } from '$lib/server/manage/errors'
import type { ManageWritePayload } from '$lib/server/manage/types'

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, 'slug 非法')

const baseWritePayloadSchema = postFrontmatterSchema.extend({
	format: z.enum(['md', 'svx']).optional(),
	source: z.string().trim().min(1, 'source 不能为空')
})

const updateWritePayloadSchema = baseWritePayloadSchema.extend({
	expectedSha: z.string().min(1, 'expectedSha 不能为空')
})

const deletePayloadSchema = z.object({
	expectedSha: z.string().min(1, 'expectedSha 不能为空')
})

function formatZodError(error: z.ZodError) {
	return error.issues.map((issue) => ({
		message: issue.message,
		path: issue.path.join('.')
	}))
}

export async function parseManageWriteFormData(
	request: Request,
	mode: 'create' | 'update'
): Promise<{ files: File[]; payload: ManageWritePayload }> {
	const contentType = request.headers.get('content-type') ?? ''

	if (!contentType.includes('multipart/form-data')) {
		throw new ManageError(415, 'invalid_content_type', '请求必须使用 multipart/form-data')
	}

	const formData = await request.formData()
	const payloadEntry = formData.get('payload')

	if (typeof payloadEntry !== 'string') {
		throw new ManageError(422, 'missing_payload', '缺少 payload JSON 字段')
	}

	let rawPayload: unknown

	try {
		rawPayload = JSON.parse(payloadEntry)
	} catch {
		throw new ManageError(422, 'invalid_payload_json', 'payload 必须是合法 JSON')
	}

	const schema = mode === 'update' ? updateWritePayloadSchema : baseWritePayloadSchema
	const parsed = schema.safeParse(rawPayload)

	if (!parsed.success) {
		throw new ManageError(422, 'invalid_payload', 'payload 校验失败', formatZodError(parsed.error))
	}

	const files = formData
		.getAll('files[]')
		.concat(formData.getAll('files'))
		.filter((entry): entry is File => entry instanceof File)

	return {
		files,
		payload: parsed.data
	}
}

export async function parseDeletePayload(request: Request) {
	let body: unknown

	try {
		body = await request.json()
	} catch {
		throw new ManageError(422, 'invalid_payload_json', '请求体必须是合法 JSON')
	}

	const parsed = deletePayloadSchema.safeParse(body)

	if (!parsed.success) {
		throw new ManageError(422, 'invalid_payload', 'payload 校验失败', formatZodError(parsed.error))
	}

	return parsed.data
}

export function parseManageSlug(value: string) {
	const parsed = slugSchema.safeParse(value)

	if (!parsed.success) {
		throw new ManageError(422, 'invalid_slug', 'slug 非法', formatZodError(parsed.error))
	}

	return parsed.data
}

export function toManageErrorResponse(error: unknown) {
	if (isManageError(error)) {
		return json(
			{
				error: {
					code: error.code,
					details: error.details ?? null,
					message: error.message
				}
			},
			{ status: error.status }
		)
	}

	const message = error instanceof Error ? error.message : '未知错误'

	return json(
		{
			error: {
				code: 'internal_error',
				details: null,
				message
			}
		},
		{ status: 500 }
	)
}
