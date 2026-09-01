import type {
	ManagePostDocument,
	ManagePostFormState,
	ManagePostWritePayload
} from '$lib/features/manage/types'

export function getTodayString() {
	const now = new Date()
	const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)

	return local.toISOString().slice(0, 10)
}

export function createRecordId(value: string) {
	const source = value.trim()
	const normalized = source
		.normalize('NFKD')
		.toLowerCase()
		.replace(/[^a-z0-9]+/gu, '-')
		.replace(/^-+|-+$/gu, '')
		.slice(0, 96)

	if (normalized || !source) {
		return normalized
	}

	let hash = 2166136261
	for (const character of source) {
		hash ^= character.codePointAt(0) ?? 0
		hash = Math.imul(hash, 16777619)
	}

	return `record-${(hash >>> 0).toString(36)}`
}

export function parseCommaSeparatedValues(value: string) {
	return Array.from(
		new Set(
			value
				.split(',')
				.map((item) => item.trim())
				.filter(Boolean)
		)
	)
}

function normalizeOptionalField(value: string) {
	const normalized = value.trim()

	return normalized ? normalized : undefined
}

export function createEmptyManagePostFormState(): ManagePostFormState {
	const today = getTodayString()

	return {
		author: 'Kimu',
		canonical: '',
		category: '',
		cover: '',
		date: today,
		description: '',
		draft: false,
		featured: false,
		format: 'svx',
		readingTime: '',
		series: '',
		slug: '',
		source: '',
		tagsInput: '',
		title: '',
		toc: true,
		updated: today
	}
}

export function createManagePostFormState(post: ManagePostDocument): ManagePostFormState {
	return {
		author: post.frontmatter.author ?? 'Kimu',
		canonical: post.frontmatter.canonical ?? '',
		category: post.frontmatter.category ?? '',
		cover: post.frontmatter.cover,
		date: post.frontmatter.date,
		description: post.frontmatter.description,
		draft: post.frontmatter.draft,
		expectedSha: post.sha,
		featured: post.frontmatter.featured,
		format: post.format,
		readingTime: post.frontmatter.readingTime ?? '',
		series: post.frontmatter.series ?? '',
		slug: post.frontmatter.slug,
		source: post.source,
		tagsInput: post.frontmatter.tags.join(', '),
		title: post.frontmatter.title,
		toc: post.frontmatter.toc,
		updated: post.frontmatter.updated
	}
}

export function toManageWritePayload(state: ManagePostFormState): ManagePostWritePayload {
	const tags = state.tagsInput
		.split(',')
		.map((tag) => tag.trim())
		.filter(Boolean)

	return {
		author: normalizeOptionalField(state.author),
		canonical: normalizeOptionalField(state.canonical),
		category: normalizeOptionalField(state.category),
		cover: state.cover.trim(),
		date: state.date.trim(),
		description: state.description.trim(),
		draft: state.draft,
		expectedSha: state.expectedSha,
		featured: state.featured,
		format: state.format,
		readingTime: normalizeOptionalField(state.readingTime),
		series: normalizeOptionalField(state.series),
		slug: state.slug.trim(),
		source: state.source,
		tags,
		title: state.title.trim(),
		toc: state.toc,
		updated: state.updated.trim()
	}
}
