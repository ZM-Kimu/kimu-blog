import { postFrontmatterSchema } from '$lib/content/schema';
import type { BlogPost, CategorySummary, TagResult, TagSummary } from '$lib/types/content';

type BlogModule = {
	metadata?: unknown;
	default: unknown;
};

const modules = import.meta.glob('/src/lib/content/blog/*.{md,svx}', {
	eager: true
}) as Record<string, BlogModule>;

const normalizeTag = (value: string) => value.toLowerCase().trim().replace(/\s+/g, '-');
const normalizeCategory = (value: string) => value.toLowerCase().trim().replace(/\s+/g, '-');

const rawPosts = Object.entries(modules)
	.map(([path, mod]) => {
		const frontmatter = postFrontmatterSchema.parse(mod.metadata ?? {});

		return {
			...frontmatter,
			path,
			permalink: `/blog/${frontmatter.slug}` as `/blog/${string}`,
			tagSlugs: frontmatter.tags.map(normalizeTag),
			categorySlug: frontmatter.category ? normalizeCategory(frontmatter.category) : null
		} satisfies BlogPost;
	})
	.sort((left, right) => right.date.localeCompare(left.date));

const slugSet = new Set<string>();

for (const post of rawPosts) {
	if (slugSet.has(post.slug)) {
		throw new Error(`重复 slug: ${post.slug}`);
	}

	slugSet.add(post.slug);
}

const publishedPosts = rawPosts.filter((post) => !post.draft);

export function getAllPosts() {
	return publishedPosts;
}

export function getLatestPosts(limit = 6) {
	return publishedPosts.slice(0, limit);
}

export function getFeaturedPosts(limit = 3) {
	return publishedPosts.filter((post) => post.featured).slice(0, limit);
}

export function getPostBySlug(slug: string) {
	return publishedPosts.find((post) => post.slug === slug) ?? null;
}

export function getPostEntries() {
	return publishedPosts.map((post) => ({ slug: post.slug }));
}

export function getAllTags() {
	const bucket = new Map<string, TagSummary>();

	for (const post of publishedPosts) {
		for (const [index, tag] of post.tags.entries()) {
			const slug = post.tagSlugs[index];
			const existing = bucket.get(slug);

			if (existing) {
				existing.count += 1;
				continue;
			}

			bucket.set(slug, { name: tag, slug, count: 1 });
		}
	}

	return Array.from(bucket.values()).sort((left, right) => left.name.localeCompare(right.name));
}

export function getAllCategories() {
	const bucket = new Map<string, CategorySummary>();

	for (const post of publishedPosts) {
		if (!post.category || !post.categorySlug) {
			continue;
		}

		const existing = bucket.get(post.categorySlug);

		if (existing) {
			existing.count += 1;
			continue;
		}

		bucket.set(post.categorySlug, {
			name: post.category,
			slug: post.categorySlug,
			count: 1
		});
	}

	return Array.from(bucket.values()).sort((left, right) => left.name.localeCompare(right.name));
}

export function getTagEntries() {
	return getAllTags().map((tag) => ({ tag: tag.slug }));
}

export function getPostsByTag(slug: string): TagResult | null {
	const posts = publishedPosts.filter((post) => post.tagSlugs.includes(slug));

	if (!posts.length) {
		return null;
	}

	const tag = getAllTags().find((item) => item.slug === slug);

	if (!tag) {
		return null;
	}

	return { tag, posts };
}

export function getRelatedPosts(post: BlogPost, limit = 3) {
	return publishedPosts
		.filter((candidate) => candidate.slug !== post.slug)
		.map((candidate) => {
			let score = 0;

			if (candidate.categorySlug && candidate.categorySlug === post.categorySlug) {
				score += 2;
			}

			score += candidate.tagSlugs.filter((tag) => post.tagSlugs.includes(tag)).length;

			return { candidate, score };
		})
		.filter((entry) => entry.score > 0)
		.sort(
			(left, right) =>
				right.score - left.score || right.candidate.date.localeCompare(left.candidate.date)
		)
		.slice(0, limit)
		.map((entry) => entry.candidate);
}
