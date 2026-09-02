import {
	blogSeriesSchema,
	groupIdSchema,
	groupNameSchema,
	normalizeGroupName,
	updateProjectSchema,
	type BlogSeries,
	type ManageGroupKind,
	type UpdateProject
} from '$lib/content/group-schema'
import type { ManageAccessActor } from '$lib/features/manage/contracts'
import { ManageError } from '$lib/server/manage/errors'
import {
	loadManageRepositoryBaseContext,
	loadRepositoryTextFiles,
	type ManageRepositoryBaseContext
} from '$lib/server/manage/repository'
import type { RepositoryManagedGroup } from '$lib/server/manage/types'

const descriptors = {
	projects: {
		prefix: 'src/lib/content/update-projects/',
		schema: updateProjectSchema,
		scope: 'update-projects'
	},
	series: {
		prefix: 'src/lib/content/blog-series/',
		schema: blogSeriesSchema,
		scope: 'blog-series'
	}
} as const

export function getGroupDescriptor(kind: ManageGroupKind) {
	return descriptors[kind]
}

export function buildManagedGroupPath(kind: ManageGroupKind, id: string) {
	return `${getGroupDescriptor(kind).prefix}${id}.json`
}

export function serializeManagedGroup(group: UpdateProject | BlogSeries) {
	return `${JSON.stringify(group, null, 2)}\n`
}

export async function loadRepositoryGroups(
	context: ManageRepositoryBaseContext,
	kind: ManageGroupKind
): Promise<RepositoryManagedGroup[]> {
	const descriptor = getGroupDescriptor(kind)
	const files = await loadRepositoryTextFiles(
		context,
		(path) =>
			path.startsWith(descriptor.prefix) &&
			path.endsWith('.json') &&
			!path.slice(descriptor.prefix.length).includes('/')
	)
	const ids = new Set<string>()

	return files.map((file) => {
		let raw: unknown
		try {
			raw = JSON.parse(file.content)
		} catch {
			throw new ManageError(500, 'invalid_group', `Invalid JSON group: ${file.path}`)
		}
		const parsed = descriptor.schema.safeParse(raw)
		if (!parsed.success) {
			throw new ManageError(500, 'invalid_group', `Invalid repository group: ${file.path}`, {
				issues: parsed.error.issues
			})
		}
		if (ids.has(parsed.data.id) || file.path !== buildManagedGroupPath(kind, parsed.data.id)) {
			throw new ManageError(409, 'invalid_group', `Invalid or duplicate group id: ${file.path}`)
		}
		ids.add(parsed.data.id)
		return { group: parsed.data, kind, path: file.path, sha: file.sha }
	})
}

export function parseGroupId(value: string) {
	const parsed = groupIdSchema.safeParse(value)
	if (!parsed.success) throw new ManageError(422, 'invalid_group_id', 'Invalid group id')
	return parsed.data
}

export function parseGroupKind(value: string): ManageGroupKind {
	if (value !== 'projects' && value !== 'series') {
		throw new ManageError(422, 'invalid_group_kind', 'Unsupported group kind')
	}
	return value
}

export async function listManagedGroups(platform: App.Platform | undefined, kind: ManageGroupKind) {
	const context = await loadManageRepositoryBaseContext(platform)
	const items = await loadRepositoryGroups(context, kind)
	return { items: items.sort((a, b) => a.group.name.localeCompare(b.group.name)) }
}

export async function renameManagedGroup(
	platform: App.Platform | undefined,
	actor: ManageAccessActor,
	kind: ManageGroupKind,
	id: string,
	payload: { expectedSha: string; name: string }
) {
	const context = await loadManageRepositoryBaseContext(platform)
	const groups = await loadRepositoryGroups(context, kind)
	const existing = groups.find((item) => item.group.id === id)
	if (!existing) throw new ManageError(404, 'group_not_found', `Group does not exist: ${id}`)
	if (existing.sha !== payload.expectedSha) {
		throw new ManageError(409, 'sha_conflict', 'expectedSha does not match the current group')
	}
	const parsedName = groupNameSchema.safeParse(normalizeGroupName(payload.name))
	if (!parsedName.success) throw new ManageError(422, 'invalid_group_name', 'Invalid group name')
	const duplicate = groups.find(
		(item) =>
			item.group.id !== id &&
			item.group.name.localeCompare(parsedName.data, undefined, { sensitivity: 'accent' }) === 0
	)
	if (duplicate) throw new ManageError(409, 'duplicate_group_name', 'Group name already exists')

	const next = { ...existing.group, name: parsedName.data }
	const blobSha = await context.client.createTextBlob(serializeManagedGroup(next))
	const treeSha = await context.client.createTree(context.snapshot.branchTreeSha, [
		{ path: existing.path, sha: blobSha }
	])
	const identity = actor.email ?? actor.name ?? actor.sub
	const commitSha = await context.client.createCommit(
		`content(${getGroupDescriptor(kind).scope}): rename ${id}\n\nactor: ${identity}\nsubject: ${actor.sub}`,
		treeSha,
		context.snapshot.branchCommitSha
	)
	await context.client.updateBranchRef(commitSha)

	return { commitSha, group: next, path: existing.path, sha: blobSha }
}
