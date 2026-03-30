import { translate, type LocaleMessages } from '$lib/i18n'

const manageErrorMessageKeys: Record<string, string> = {
	access_unauthorized: 'manage.errors.accessUnauthorized',
	manage_request_failed: 'manage.errors.manageRequestFailed',
	post_list_load_failed: 'manage.errors.postListLoadFailed',
	post_load_failed: 'manage.errors.postLoadFailed',
	session_init_failed: 'manage.errors.sessionInitFailed',
	invalid_content_type: 'manage.errors.invalidContentType',
	missing_payload: 'manage.errors.missingPayload',
	invalid_payload_json: 'manage.errors.invalidPayloadJson',
	invalid_payload: 'manage.errors.invalidPayload',
	invalid_slug: 'manage.errors.invalidSlug',
	post_not_found: 'manage.errors.postNotFound',
	duplicate_slug: 'manage.errors.duplicateSlug',
	path_conflict: 'manage.errors.pathConflict',
	sha_conflict: 'manage.errors.shaConflict',
	duplicate_upload_name: 'manage.errors.duplicateUploadName',
	invalid_upload_name: 'manage.errors.invalidUploadName',
	invalid_upload_size: 'manage.errors.invalidUploadSize',
	invalid_upload_type: 'manage.errors.invalidUploadType',
	invalid_cover_path: 'manage.errors.invalidCoverPath',
	missing_cover_path: 'manage.errors.missingCoverPath',
	invalid_source: 'manage.errors.invalidSource',
	unresolved_upload_reference: 'manage.errors.unresolvedUploadReference',
	missing_platform_env: 'manage.errors.missingPlatformEnv',
	missing_manage_env: 'manage.errors.missingManageEnv',
	github_request_failed: 'manage.errors.githubRequestFailed',
	github_tree_truncated: 'manage.errors.githubTreeTruncated',
	branch_conflict: 'manage.errors.branchConflict',
	invalid_origin: 'manage.errors.invalidOrigin',
	invalid_fetch_site: 'manage.errors.invalidFetchSite',
	invalid_csrf: 'manage.errors.invalidCsrf',
	csrf_required: 'manage.errors.csrfRequired',
	internal_error: 'manage.errors.internalError'
}

export function resolveManageErrorMessage(
	messages: LocaleMessages | undefined,
	code: string,
	rawMessage?: string | null
) {
	const messageKey = manageErrorMessageKeys[code]
	if (messageKey) {
		return translate(messages, messageKey)
	}

	if (rawMessage && !/^[a-z0-9_:-]+$/iu.test(rawMessage)) {
		return rawMessage
	}

	return translate(messages, 'manage.errors.internalError')
}
