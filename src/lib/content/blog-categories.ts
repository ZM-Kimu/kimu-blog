export const blogCategories = ['development', 'daily', 'notes'] as const

export type BlogCategory = (typeof blogCategories)[number]

export function getBlogCategoryMessageKey(category: BlogCategory) {
	return `common.categories.${category}` as const
}
