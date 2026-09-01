import { favoriteEntrySchema, updateEntrySchema } from '$lib/content/info-flow-schema'
import type {
	ManageAccessActor,
	ManageRecordKind,
	ManageRecordWriteResponse
} from '$lib/features/manage/contracts'
import { ManageError } from '$lib/server/manage/errors'
import {
	loadManageRepositoryBaseContext,
	loadRepositoryTextFiles
} from '$lib/server/manage/repository'
import type {
	ManageRecordEntry,
	ManageRecordWritePayload,
	RepositoryManagedRecord
} from '$lib/server/manage/types'

const recordDescriptors = {
	updates: {
		prefix: 'src/lib/content/updates/',
		schema: updateEntrySchema,
		commitScope: 'updates'
	},
	favorites: {
		prefix: 'src/lib/content/favorites/',
		schema: favoriteEntrySchema,
		commitScope: 'favorites'
	}
} as const

function getRecordDescriptor(kind: ManageRecordKind) {
	return recordDescriptors[kind]
}

function buildManagedRecordPath(kind: ManageRecordKind, id: string) {
	return `${getRecordDescriptor(kind).prefix}${id}.json`
}

function parseRepositoryRecord(
	kind: ManageRecordKind,
	file: { content: string; path: string; sha: string }
): RepositoryManagedRecord {
	let value: unknown

	try {
		value = JSON.parse(file.content)
	} catch {
		throw new ManageError(500, 'invalid_record', `Invalid JSON record: ${file.path}`)
	}

	const descriptor = getRecordDescriptor(kind)
	const parsed = descriptor.schema.safeParse(value)

	if (!parsed.success) {
		throw new ManageError(500, 'invalid_record', `Invalid repository record: ${file.path}`, {
			issues: parsed.error.issues
		})
	}

	if (file.path !== buildManagedRecordPath(kind, parsed.data.id)) {
		throw new ManageError(500, 'invalid_record', `Record filename does not match id: ${file.path}`)
	}

	return {
		entry: parsed.data,
		path: file.path,
		sha: file.sha
	}
}

async function loadManagedRecordContext(
	platform: App.Platform | undefined,
	kind: ManageRecordKind
) {
	const context = await loadManageRepositoryBaseContext(platform)
	const prefix = getRecordDescriptor(kind).prefix
	const files = await loadRepositoryTextFiles(
		context,
		(path) =>
			path.startsWith(prefix) && path.endsWith('.json') && !path.slice(prefix.length).includes('/')
	)
	const records = files.map((file) => parseRepositoryRecord(kind, file))
	const ids = new Set<string>()

	for (const record of records) {
		if (ids.has(record.entry.id)) {
			throw new ManageError(409, 'duplicate_record_id', `Duplicate record id: ${record.entry.id}`)
		}

		ids.add(record.entry.id)
	}

	return { ...context, records }
}

function normalizeRecordEntry(
	kind: ManageRecordKind,
	payload: ManageRecordWritePayload
): ManageRecordEntry {
	const rawEntry: Partial<ManageRecordWritePayload> = { ...payload }
	delete rawEntry.expectedSha
	const descriptor = getRecordDescriptor(kind)
	const parsed = descriptor.schema.safeParse(rawEntry)

	if (!parsed.success) {
		throw new ManageError(422, 'invalid_payload', 'Record validation failed', {
			issues: parsed.error.issues
		})
	}

	return parsed.data
}

function serializeRecord(entry: ManageRecordEntry) {
	return `${JSON.stringify(entry, null, 2)}\n`
}

function findRecord(records: RepositoryManagedRecord[], id: string) {
	return records.find((record) => record.entry.id === id) ?? null
}

function getRecordDate(kind: ManageRecordKind, entry: ManageRecordEntry) {
	if (kind === 'updates' && 'date' in entry) {
		return entry.date
	}

	if (kind === 'favorites' && 'added' in entry) {
		return entry.added
	}

	throw new ManageError(500, 'invalid_record', `Record does not match kind: ${kind}`)
}

function buildCommitMessage(
	action: 'create' | 'update' | 'delete',
	kind: ManageRecordKind,
	id: string,
	actor: ManageAccessActor
) {
	const identity = actor.email ?? actor.name ?? actor.sub

	return `content(${getRecordDescriptor(kind).commitScope}): ${action} ${id}\n\nactor: ${identity}\nsubject: ${actor.sub}`
}

function toWriteResponse(
	record: { entry: ManageRecordEntry; path: string; sha: string },
	commitSha: string
): ManageRecordWriteResponse {
	return {
		commitSha,
		id: record.entry.id,
		path: record.path,
		sha: record.sha
	}
}

export async function listManagedRecords(
	platform: App.Platform | undefined,
	kind: ManageRecordKind
) {
	const { records } = await loadManagedRecordContext(platform, kind)

	return {
		items: records.sort((left, right) =>
			getRecordDate(kind, right.entry).localeCompare(getRecordDate(kind, left.entry))
		)
	}
}

export async function getManagedRecord(
	platform: App.Platform | undefined,
	kind: ManageRecordKind,
	id: string
) {
	const { records } = await loadManagedRecordContext(platform, kind)
	const record = findRecord(records, id)

	if (!record) {
		throw new ManageError(404, 'record_not_found', `Record does not exist: ${id}`)
	}

	return record
}

export async function createManagedRecord(
	platform: App.Platform | undefined,
	actor: ManageAccessActor,
	kind: ManageRecordKind,
	payload: ManageRecordWritePayload
) {
	const { client, records, snapshot } = await loadManagedRecordContext(platform, kind)
	const entry = normalizeRecordEntry(kind, payload)
	const targetPath = buildManagedRecordPath(kind, entry.id)

	if (findRecord(records, entry.id) || snapshot.treeEntries.has(targetPath)) {
		throw new ManageError(409, 'duplicate_record_id', `Record already exists: ${entry.id}`)
	}

	const blobSha = await client.createTextBlob(serializeRecord(entry))
	const treeSha = await client.createTree(snapshot.branchTreeSha, [
		{ path: targetPath, sha: blobSha }
	])
	const commitSha = await client.createCommit(
		buildCommitMessage('create', kind, entry.id, actor),
		treeSha,
		snapshot.branchCommitSha
	)
	await client.updateBranchRef(commitSha)

	return toWriteResponse({ entry, path: targetPath, sha: blobSha }, commitSha)
}

export async function updateManagedRecord(
	platform: App.Platform | undefined,
	actor: ManageAccessActor,
	kind: ManageRecordKind,
	currentId: string,
	payload: ManageRecordWritePayload
) {
	const { client, records, snapshot } = await loadManagedRecordContext(platform, kind)
	const existing = findRecord(records, currentId)

	if (!existing) {
		throw new ManageError(404, 'record_not_found', `Record does not exist: ${currentId}`)
	}

	if (payload.expectedSha !== existing.sha) {
		throw new ManageError(409, 'sha_conflict', 'expectedSha does not match the current file')
	}

	const entry = normalizeRecordEntry(kind, payload)
	const nextPath = buildManagedRecordPath(kind, entry.id)
	const conflicting = findRecord(records, entry.id)

	if (
		(conflicting && conflicting.path !== existing.path) ||
		(nextPath !== existing.path && snapshot.treeEntries.has(nextPath))
	) {
		throw new ManageError(409, 'duplicate_record_id', `Record already exists: ${entry.id}`)
	}

	const blobSha = await client.createTextBlob(serializeRecord(entry))
	const changes: Array<{ path: string; sha: string | null }> = [{ path: nextPath, sha: blobSha }]

	if (nextPath !== existing.path) {
		changes.push({ path: existing.path, sha: null })
	}

	const treeSha = await client.createTree(snapshot.branchTreeSha, changes)
	const commitSha = await client.createCommit(
		buildCommitMessage('update', kind, entry.id, actor),
		treeSha,
		snapshot.branchCommitSha
	)
	await client.updateBranchRef(commitSha)

	return toWriteResponse({ entry, path: nextPath, sha: blobSha }, commitSha)
}

export async function deleteManagedRecord(
	platform: App.Platform | undefined,
	actor: ManageAccessActor,
	kind: ManageRecordKind,
	id: string,
	expectedSha: string
) {
	const { client, records, snapshot } = await loadManagedRecordContext(platform, kind)
	const existing = findRecord(records, id)

	if (!existing) {
		throw new ManageError(404, 'record_not_found', `Record does not exist: ${id}`)
	}

	if (expectedSha !== existing.sha) {
		throw new ManageError(409, 'sha_conflict', 'expectedSha does not match the current file')
	}

	const treeSha = await client.createTree(snapshot.branchTreeSha, [
		{ path: existing.path, sha: null }
	])
	const commitSha = await client.createCommit(
		buildCommitMessage('delete', kind, existing.entry.id, actor),
		treeSha,
		snapshot.branchCommitSha
	)
	await client.updateBranchRef(commitSha)

	return toWriteResponse(existing, commitSha)
}
