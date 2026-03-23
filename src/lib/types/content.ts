import type { PostFrontmatter } from '$lib/content/schema';

export interface BlogPost extends PostFrontmatter {
	path: string;
	permalink: `/blog/${string}`;
	tagSlugs: string[];
}

export interface TagSummary {
	name: string;
	slug: string;
	count: number;
}

export interface TagResult {
	tag: TagSummary;
	posts: BlogPost[];
}
