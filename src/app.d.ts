import type { ManageAccessActor } from '$lib/server/manage/types';
import type { AppLocale } from '$lib/i18n/config';
import type { I18nPayload } from '$lib/i18n';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	interface Env {
		CF_ACCESS_TEAM_DOMAIN: string;
		CF_ACCESS_AUD: string;
		GITHUB_APP_ID: string;
		GITHUB_APP_INSTALLATION_ID: string;
		GITHUB_APP_PRIVATE_KEY: string;
		GITHUB_REPO_OWNER: string;
		GITHUB_REPO_NAME: string;
		GITHUB_REPO_BRANCH?: string;
		GITHUB_COMMITTER_NAME: string;
		GITHUB_COMMITTER_EMAIL: string;
	}

	namespace App {
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}

		// interface Error {}
		interface Locals {
			manageAccess: ManageAccessActor | null;
			locale?: AppLocale;
		}

		interface PageData {
			i18n?: I18nPayload;
		}
		// interface PageState {}
	}
}

export {};
