import type {
	ManagePostDocument,
	ManagePostFormState,
	ManagePostWritePayload
} from '$lib/features/manage/types'

function getTodayString() {
	const now = new Date()
	const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)

	return local.toISOString().slice(0, 10)
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
