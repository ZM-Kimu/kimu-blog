// This runtime service layer is intentionally manage-only.
// Public routes and public APIs must not import manage server modules as a
// shortcut for Cloudflare Function access.
export {
	createManagedPost,
	deleteManagedPost,
	getManagedPost,
	getManageHealth,
	getManageSession,
	listManagedPosts,
	updateManagedPost
} from '$lib/server/manage/posts'
