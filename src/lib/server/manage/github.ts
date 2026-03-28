import { SignJWT, importPKCS8 } from 'jose'

import { ManageError } from '$lib/server/manage/errors'
import type { GitHubTreeEntry, ManageConfig } from '$lib/server/manage/types'

const GITHUB_API_BASE = 'https://api.github.com'
const GITHUB_API_VERSION = '2022-11-28'
const GITHUB_USER_AGENT = 'kimu-blog-manage-api'

interface GitHubRefResponse {
	object: {
		sha: string
		type: string
	}
}

interface GitHubCommitResponse {
	sha: string
	tree: {
		sha: string
	}
}

interface GitHubTreeResponse {
	sha: string
	tree: GitHubTreeEntry[]
	truncated: boolean
}

interface GitHubBlobResponse {
	content: string
	encoding: 'base64' | string
	sha: string
}

interface GitHubCreateBlobResponse {
	sha: string
}

interface GitHubCreateTreeResponse {
	sha: string
}

interface GitHubCreateCommitResponse {
	sha: string
}

interface GitHubInstallationTokenResponse {
	token: string
}

interface GitHubRequestInit extends Omit<RequestInit, 'headers'> {
	headers?: HeadersInit
}

function normalizePrivateKey(privateKey: string) {
	return privateKey.replace(/\\n/gu, '\n').replace(/\r\n/gu, '\n').trim()
}

function concatBytes(chunks: Uint8Array[]) {
	const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
	const result = new Uint8Array(totalLength)
	let offset = 0

	for (const chunk of chunks) {
		result.set(chunk, offset)
		offset += chunk.length
	}

	return result
}

function encodeDerLength(length: number) {
	if (length < 0x80) {
		return Uint8Array.of(length)
	}

	const bytes: number[] = []
	let remaining = length

	while (remaining > 0) {
		bytes.unshift(remaining & 0xff)
		remaining >>= 8
	}

	return Uint8Array.of(0x80 | bytes.length, ...bytes)
}

function encodeDer(tag: number, value: Uint8Array) {
	return concatBytes([Uint8Array.of(tag), encodeDerLength(value.length), value])
}

function encodeGitHubPath(path: string) {
	return path
		.split('/')
		.map((segment) => encodeURIComponent(segment))
		.join('/')
}

function bytesToBase64(bytes: Uint8Array) {
	let binary = ''

	for (let index = 0; index < bytes.length; index += 0x8000) {
		const chunk = bytes.subarray(index, index + 0x8000)
		binary += String.fromCharCode(...chunk)
	}

	return btoa(binary)
}

function base64ToBytes(value: string) {
	const binary = atob(value.replace(/\s+/gu, ''))

	return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

function pemToDer(privateKey: string, label: string) {
	const beginMarker = `-----BEGIN ${label}-----`
	const endMarker = `-----END ${label}-----`

	if (!privateKey.startsWith(beginMarker) || !privateKey.endsWith(endMarker)) {
		throw new ManageError(
			500,
			'github_private_key_format_invalid',
			`GITHUB_APP_PRIVATE_KEY 必须是 ${label} PEM`
		)
	}

	const base64 = privateKey.slice(beginMarker.length, privateKey.length - endMarker.length)

	return base64ToBytes(base64)
}

function derToPem(value: Uint8Array, label: string) {
	const lines = bytesToBase64(value).match(/.{1,64}/gu) ?? []

	return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----`
}

function pkcs1ToPkcs8(privateKey: string) {
	const version = Uint8Array.of(0x02, 0x01, 0x00)
	const algorithmIdentifier = Uint8Array.of(
		0x30,
		0x0d,
		0x06,
		0x09,
		0x2a,
		0x86,
		0x48,
		0x86,
		0xf7,
		0x0d,
		0x01,
		0x01,
		0x01,
		0x05,
		0x00
	)
	const privateKeyDer = pemToDer(privateKey, 'RSA PRIVATE KEY')

	return derToPem(
		encodeDer(0x30, concatBytes([version, algorithmIdentifier, encodeDer(0x04, privateKeyDer)])),
		'PRIVATE KEY'
	)
}

function getPkcs8PrivateKey(privateKey: string) {
	if (privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
		return privateKey
	}

	if (privateKey.includes('-----BEGIN RSA PRIVATE KEY-----')) {
		return pkcs1ToPkcs8(privateKey)
	}

	throw new ManageError(
		500,
		'github_private_key_format_invalid',
		'GITHUB_APP_PRIVATE_KEY 必须是 GitHub App 导出的 PEM 私钥，支持 PRIVATE KEY 和 RSA PRIVATE KEY'
	)
}

function decodeBase64Text(content: string) {
	const binary = atob(content.replace(/\n/gu, ''))
	const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))

	return new TextDecoder().decode(bytes)
}

function buildGitHubUrl(config: ManageConfig, path: string) {
	return `${GITHUB_API_BASE}/repos/${encodeURIComponent(config.githubRepoOwner)}/${encodeURIComponent(
		config.githubRepoName
	)}${path}`
}

async function parseGitHubError(response: Response) {
	const text = (await response.text()).trim()

	if (!text) {
		return {
			details: null,
			message: response.statusText
		}
	}

	try {
		const payload = JSON.parse(text) as Record<string, unknown>

		return {
			details: payload,
			message: typeof payload.message === 'string' ? payload.message : response.statusText
		}
	} catch {
		return {
			details: { raw: text },
			message: text
		}
	}
}

async function githubRequest<T>(url: string, token: string, init?: GitHubRequestInit): Promise<T> {
	const headers = new Headers(init?.headers)
	headers.set('Accept', 'application/vnd.github+json')
	headers.set('Authorization', `Bearer ${token}`)
	headers.set('User-Agent', GITHUB_USER_AGENT)
	headers.set('X-GitHub-Api-Version', GITHUB_API_VERSION)

	const response = await fetch(url, {
		...init,
		headers
	})

	if (!response.ok) {
		const { details, message } = await parseGitHubError(response)
		throw new ManageError(response.status, 'github_request_failed', message, details)
	}

	if (response.status === 204) {
		return undefined as T
	}

	return (await response.json()) as T
}

async function createGitHubAppJwt(config: ManageConfig) {
	const privateKey = await importPKCS8(
		getPkcs8PrivateKey(normalizePrivateKey(config.githubAppPrivateKey)),
		'RS256'
	)
	const now = Math.floor(Date.now() / 1000)

	return new SignJWT({})
		.setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
		.setIssuedAt(now - 60)
		.setExpirationTime(now + 9 * 60)
		.setIssuer(config.githubAppId)
		.sign(privateKey)
}

export interface GitHubBranchState {
	commitSha: string
	treeSha: string
}

export interface GitHubRepositoryClient {
	createBinaryBlob(bytes: Uint8Array): Promise<string>
	createCommit(message: string, treeSha: string, parentCommitSha: string): Promise<string>
	createTextBlob(content: string): Promise<string>
	createTree(
		baseTreeSha: string,
		changes: Array<{ path: string; sha: string | null }>
	): Promise<string>
	getBlobText(sha: string): Promise<string>
	getBranchState(): Promise<GitHubBranchState>
	getRecursiveTree(treeSha: string): Promise<GitHubTreeEntry[]>
	updateBranchRef(commitSha: string): Promise<void>
}

export async function createGitHubRepositoryClient(
	config: ManageConfig
): Promise<GitHubRepositoryClient> {
	const appJwt = await createGitHubAppJwt(config)
	const installation = await githubRequest<GitHubInstallationTokenResponse>(
		`${GITHUB_API_BASE}/app/installations/${encodeURIComponent(config.githubAppInstallationId)}/access_tokens`,
		appJwt,
		{
			method: 'POST'
		}
	)
	const installationToken = installation.token

	return {
		async createBinaryBlob(bytes) {
			const response = await githubRequest<GitHubCreateBlobResponse>(
				buildGitHubUrl(config, '/git/blobs'),
				installationToken,
				{
					body: JSON.stringify({
						content: bytesToBase64(bytes),
						encoding: 'base64'
					}),
					headers: {
						'Content-Type': 'application/json'
					},
					method: 'POST'
				}
			)

			return response.sha
		},
		async createCommit(message, treeSha, parentCommitSha) {
			const now = new Date().toISOString()
			const response = await githubRequest<GitHubCreateCommitResponse>(
				buildGitHubUrl(config, '/git/commits'),
				installationToken,
				{
					body: JSON.stringify({
						author: {
							date: now,
							email: config.githubCommitterEmail,
							name: config.githubCommitterName
						},
						committer: {
							date: now,
							email: config.githubCommitterEmail,
							name: config.githubCommitterName
						},
						message,
						parents: [parentCommitSha],
						tree: treeSha
					}),
					headers: {
						'Content-Type': 'application/json'
					},
					method: 'POST'
				}
			)

			return response.sha
		},
		async createTextBlob(content) {
			const response = await githubRequest<GitHubCreateBlobResponse>(
				buildGitHubUrl(config, '/git/blobs'),
				installationToken,
				{
					body: JSON.stringify({
						content,
						encoding: 'utf-8'
					}),
					headers: {
						'Content-Type': 'application/json'
					},
					method: 'POST'
				}
			)

			return response.sha
		},
		async createTree(baseTreeSha, changes) {
			const response = await githubRequest<GitHubCreateTreeResponse>(
				buildGitHubUrl(config, '/git/trees'),
				installationToken,
				{
					body: JSON.stringify({
						base_tree: baseTreeSha,
						tree: changes.map((change) => ({
							mode: '100644',
							path: change.path,
							sha: change.sha,
							type: 'blob'
						}))
					}),
					headers: {
						'Content-Type': 'application/json'
					},
					method: 'POST'
				}
			)

			return response.sha
		},
		async getBlobText(sha) {
			const response = await githubRequest<GitHubBlobResponse>(
				buildGitHubUrl(config, `/git/blobs/${encodeURIComponent(sha)}`),
				installationToken
			)

			if (response.encoding !== 'base64') {
				throw new ManageError(
					502,
					'github_blob_encoding_invalid',
					`不支持的 blob 编码: ${response.encoding}`
				)
			}

			return decodeBase64Text(response.content)
		},
		async getBranchState() {
			const ref = await githubRequest<GitHubRefResponse>(
				buildGitHubUrl(config, `/git/ref/heads/${encodeGitHubPath(config.githubRepoBranch)}`),
				installationToken
			)
			const commit = await githubRequest<GitHubCommitResponse>(
				buildGitHubUrl(config, `/git/commits/${encodeURIComponent(ref.object.sha)}`),
				installationToken
			)

			return {
				commitSha: ref.object.sha,
				treeSha: commit.tree.sha
			}
		},
		async getRecursiveTree(treeSha) {
			const response = await githubRequest<GitHubTreeResponse>(
				buildGitHubUrl(config, `/git/trees/${encodeURIComponent(treeSha)}?recursive=1`),
				installationToken
			)

			if (response.truncated) {
				throw new ManageError(502, 'github_tree_truncated', 'GitHub tree 结果被截断')
			}

			return response.tree
		},
		async updateBranchRef(commitSha) {
			try {
				await githubRequest<void>(
					buildGitHubUrl(config, `/git/refs/heads/${encodeGitHubPath(config.githubRepoBranch)}`),
					installationToken,
					{
						body: JSON.stringify({
							force: false,
							sha: commitSha
						}),
						headers: {
							'Content-Type': 'application/json'
						},
						method: 'PATCH'
					}
				)
			} catch (error) {
				if (error instanceof ManageError && (error.status === 409 || error.status === 422)) {
					throw new ManageError(
						409,
						'branch_conflict',
						'分支头已经变化，请重新获取最新内容后再提交'
					)
				}

				throw error
			}
		}
	}
}
