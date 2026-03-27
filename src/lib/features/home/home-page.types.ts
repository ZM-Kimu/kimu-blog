export type HomePageCategory = {
	slug: string;
	name: string;
	count: number;
};

export type HomePageFeaturedPost = {
	permalink: string;
	title: string;
	category?: string | null;
};

export type HomePageData = {
	featuredPost: HomePageFeaturedPost | null;
	categories: HomePageCategory[];
	totalPosts: number;
};

export type HomePageMissionPreviewItem = {
	slug: string;
	title: string;
	kicker: string;
	href: string;
	state: string;
	tone: 'cyan' | 'blue' | 'amber' | 'slate';
	count: number;
};
