import { ManageError } from '$lib/server/manage/errors'
import type { ManageConfig } from '$lib/server/manage/types'

function normalizeTeamDomain(value: string) {
	return value.replace(/^https?:\/\//u, '').replace(/\/+$/u, '')
}

export function getManageConfig(platform: App.Platform | undefined): ManageConfig {
	if (!platform?.env) {
		throw new ManageError(500, 'missing_platform_env', '当前运行时没有 Cloudflare env 绑定')
	}

	const requiredKeys = [
		'CF_ACCESS_AUD',
		'CF_ACCESS_TEAM_DOMAIN',
		'GITHUB_APP_ID',
		'GITHUB_APP_INSTALLATION_ID',
		'GITHUB_APP_PRIVATE_KEY',
		'GITHUB_REPO_OWNER',
		'GITHUB_REPO_NAME',
		'GITHUB_COMMITTER_NAME',
		'GITHUB_COMMITTER_EMAIL'
	] as const

	for (const key of requiredKeys) {
		if (!platform.env[key]?.trim()) {
			throw new ManageError(500, 'missing_manage_env', `缺少环境变量: ${key}`)
		}
	}

	return {
		cfAccessAud: platform.env.CF_ACCESS_AUD.trim(),
		cfAccessTeamDomain: normalizeTeamDomain(platform.env.CF_ACCESS_TEAM_DOMAIN.trim()),
		githubAppId: platform.env.GITHUB_APP_ID.trim(),
		githubAppInstallationId: platform.env.GITHUB_APP_INSTALLATION_ID.trim(),
		githubAppPrivateKey: platform.env.GITHUB_APP_PRIVATE_KEY.trim(),
		githubCommitterEmail: platform.env.GITHUB_COMMITTER_EMAIL.trim(),
		githubCommitterName: platform.env.GITHUB_COMMITTER_NAME.trim(),
		githubRepoBranch: platform.env.GITHUB_REPO_BRANCH?.trim() || 'main',
		githubRepoName: platform.env.GITHUB_REPO_NAME.trim(),
		githubRepoOwner: platform.env.GITHUB_REPO_OWNER.trim()
	}
}
