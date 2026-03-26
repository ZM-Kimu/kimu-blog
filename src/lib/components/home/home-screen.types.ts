export type HomeScreenCategory = {
	slug: string;
	name: string;
	count: number;
};

export type HomeScreenFeaturedPost = {
	permalink: string;
	title: string;
	category?: string | null;
};

export type HomeScreenData = {
	featuredPost: HomeScreenFeaturedPost | null;
	categories: HomeScreenCategory[];
	totalPosts: number;
};

export type HomeMissionPreviewItem = {
	slug: string;
	title: string;
	kicker: string;
	href: string;
	state: string;
	tone: 'cyan' | 'blue' | 'amber' | 'slate';
	count: number;
};
