import { favoriteEntrySchema, updateEntrySchema } from '$lib/content/info-flow-schema'
import {
	groupNameSchema,
	normalizeGroupName,
	resolveProjectCurrentProgress,
	updateProjectSchema,
	type UpdateProject
} from '$lib/content/group-schema'
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
import {
	buildManagedGroupPath,
	loadRepositoryGroups,
	serializeManagedGroup
} from '$lib/server/manage/groups'

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

	const projects = kind === 'updates' ? await loadRepositoryGroups(context, 'projects') : []

	return { ...context, projects, records }
}

function normalizeRecordEntry(
	kind: ManageRecordKind,
	payload: ManageRecordWritePayload
): ManageRecordEntry {
	const rawEntry: Record<string, unknown> = { ...payload }
	delete rawEntry.expectedSha
	delete rawEntry.projectName
	const descriptor = getRecordDescriptor(kind)
	const parsed = descriptor.schema.safeParse(rawEntry)

	if (!parsed.success) {
		throw new ManageError(422, 'invalid_payload', 'Record validation failed', {
			issues: parsed.error.issues
		})
	}

	if (kind === 'favorites' && 'added' in parsed.data) {
		const tags = new Map<string, string>()
		for (const tag of parsed.data.tags) {
			const display = tag.trim().replace(/\s+/gu, ' ')
			const key = display.toLocaleLowerCase()
			if (key && !tags.has(key)) tags.set(key, display)
		}
		return { ...parsed.data, tags: Array.from(tags.values()) }
	}

	return parsed.data
}

async function buildProjectChanges(
	client: Awaited<ReturnType<typeof loadManageRepositoryBaseContext>>['client'],
	projects: Awaited<ReturnType<typeof loadRepositoryGroups>>,
	entries: ManageRecordEntry[],
	newProject?: { id: string; name: string }
) {
	const updates = entries.filter(
		(entry): entry is Extract<ManageRecordEntry, { date: string }> => 'date' in entry
	)
	const referencedIds = new Set(
		updates.flatMap((entry) => (entry.project ? [entry.project.id] : []))
	)
	const projectsById = new Map(projects.map((record) => [record.group.id, record]))
	const changes: Array<{ path: string; sha: string | null }> = []

	for (const id of referencedIds) {
		const existing = projectsById.get(id)
		let project: UpdateProject

		if (existing) {
			if (
				newProject?.id === id &&
				existing.group.name.localeCompare(normalizeGroupName(newProject.name), undefined, {
					sensitivity: 'accent'
				}) !== 0
			) {
				throw new ManageError(409, 'duplicate_group_id', 'Generated project id already exists')
			}
			project = updateProjectSchema.parse(existing.group)
		} else {
			const parsedName = groupNameSchema.safeParse(
				newProject?.id === id ? normalizeGroupName(newProject.name) : undefined
			)
			if (!parsedName.success) {
				throw new ManageError(422, 'missing_group_name', 'A new project requires a name')
			}
			if (
				projects.some(
					(item) =>
						item.group.name.localeCompare(parsedName.data, undefined, { sensitivity: 'accent' }) ===
						0
				)
			) {
				throw new ManageError(409, 'duplicate_group_name', 'Project name already exists')
			}
			project = { id, name: parsedName.data, currentProgress: 0 }
		}

		const next = { ...project, currentProgress: resolveProjectCurrentProgress(updates, id) ?? 0 }

		if (!existing || JSON.stringify(next) !== JSON.stringify(existing.group)) {
			changes.push({
				path: buildManagedGroupPath('projects', id),
				sha: await client.createTextBlob(serializeManagedGroup(next))
			})
		}
	}

	for (const existing of projects) {
		if (!referencedIds.has(existing.group.id)) changes.push({ path: existing.path, sha: null })
	}

	return changes
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
	const { client, projects, records, snapshot } = await loadManagedRecordContext(platform, kind)
	const entry = normalizeRecordEntry(kind, payload)
	const targetPath = buildManagedRecordPath(kind, entry.id)

	if (findRecord(records, entry.id) || snapshot.treeEntries.has(targetPath)) {
		throw new ManageError(409, 'duplicate_record_id', `Record already exists: ${entry.id}`)
	}

	const blobSha = await client.createTextBlob(serializeRecord(entry))
	const groupChanges =
		kind === 'updates'
			? await buildProjectChanges(
					client,
					projects,
					[...records.map((record) => record.entry), entry],
					'project' in entry && entry.project && 'projectName' in payload && payload.projectName
						? { id: entry.project.id, name: payload.projectName }
						: undefined
				)
			: []
	const treeSha = await client.createTree(snapshot.branchTreeSha, [
		{ path: targetPath, sha: blobSha },
		...groupChanges
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
	const { client, projects, records, snapshot } = await loadManagedRecordContext(platform, kind)
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
	if (kind === 'updates') {
		const resultingEntries = records
			.filter((record) => record.path !== existing.path)
			.map((record) => record.entry)
			.concat(entry)
		changes.push(
			...(await buildProjectChanges(
				client,
				projects,
				resultingEntries,
				'project' in entry && entry.project && 'projectName' in payload && payload.projectName
					? { id: entry.project.id, name: payload.projectName }
					: undefined
			))
		)
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
	const { client, projects, records, snapshot } = await loadManagedRecordContext(platform, kind)
	const existing = findRecord(records, id)

	if (!existing) {
		throw new ManageError(404, 'record_not_found', `Record does not exist: ${id}`)
	}

	if (expectedSha !== existing.sha) {
		throw new ManageError(409, 'sha_conflict', 'expectedSha does not match the current file')
	}

	const changes: Array<{ path: string; sha: string | null }> = [{ path: existing.path, sha: null }]
	if (kind === 'updates') {
		changes.push(
			...(await buildProjectChanges(
				client,
				projects,
				records.filter((record) => record.path !== existing.path).map((record) => record.entry)
			))
		)
	}
	const treeSha = await client.createTree(snapshot.branchTreeSha, changes)
	const commitSha = await client.createCommit(
		buildCommitMessage('delete', kind, existing.entry.id, actor),
		treeSha,
		snapshot.branchCommitSha
	)
	await client.updateBranchRef(commitSha)

	return toWriteResponse(existing, commitSha)
}
