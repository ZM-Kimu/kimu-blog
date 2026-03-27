import type { ManageAccessActor } from '$lib/server/manage/types';

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
		}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};
