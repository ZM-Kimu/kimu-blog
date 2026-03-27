export type ManagedPostFormat = 'md' | 'svx';

export interface ManageAccessActor {
	audience: string[];
	email: string | null;
	issuer: string;
	name: string | null;
	sub: string;
}

export interface ManageRepositoryInfo {
	branch: string;
	commitSha?: string;
	name: string;
	owner: string;
}

export interface ManageSessionResponse {
	actor: ManageAccessActor;
	csrfToken: string;
	repository: ManageRepositoryInfo;
}

export interface ManagePostFrontmatter {
	author?: string;
	canonical?: string;
	category?: string;
	cover: string;
	date: string;
	description: string;
	draft: boolean;
	featured: boolean;
	readingTime?: string;
	series?: string;
	slug: string;
	tags: string[];
	title: string;
	toc: boolean;
	updated: string;
}

export interface ManagePostDocument {
	assetPaths: string[];
	format: ManagedPostFormat;
	frontmatter: ManagePostFrontmatter;
	path: string;
	sha: string;
	slug: string;
	source: string;
}

export interface ManagePostListItem {
	category?: string;
	date: string;
	description: string;
	draft: boolean;
	featured: boolean;
	format: ManagedPostFormat;
	sha: string;
	slug: string;
	title: string;
	updated: string;
}

export interface ManagePostListResponse {
	items: ManagePostListItem[];
}

export interface ManagePostWriteResponse {
	assetPaths: string[];
	commitSha: string;
	format: ManagedPostFormat;
	path: string;
	sha: string;
	slug: string;
}

export interface ManagePostWritePayload extends ManagePostFrontmatter {
	expectedSha?: string;
	format?: ManagedPostFormat;
	source: string;
}

export interface ManagePostFormState {
	author: string;
	canonical: string;
	category: string;
	cover: string;
	date: string;
	description: string;
	draft: boolean;
	expectedSha?: string;
	featured: boolean;
	format: ManagedPostFormat;
	readingTime: string;
	series: string;
	slug: string;
	source: string;
	tagsInput: string;
	title: string;
	toc: boolean;
	updated: string;
}

export interface ManageApiErrorPayload {
	error?: {
		code?: string;
		details?: unknown;
		message?: string;
	};
}
