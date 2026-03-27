import { createRemoteJWKSet, jwtVerify } from 'jose';

import { ManageError } from '$lib/server/manage/errors';
import type { ManageAccessActor } from '$lib/server/manage/types';

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getRemoteJwkSet(teamDomain: string) {
	const existing = jwksCache.get(teamDomain);

	if (existing) {
		return existing;
	}

	const jwks = createRemoteJWKSet(new URL(`https://${teamDomain}/cdn-cgi/access/certs`));
	jwksCache.set(teamDomain, jwks);

	return jwks;
}

function getAudience(value: unknown) {
	if (typeof value === 'string') {
		return [value];
	}

	if (Array.isArray(value)) {
		return value.filter((entry): entry is string => typeof entry === 'string');
	}

	return [];
}

export async function verifyManageAccessToken(
	token: string,
	teamDomain: string,
	audience: string
): Promise<ManageAccessActor> {
	try {
		const { payload } = await jwtVerify(token, getRemoteJwkSet(teamDomain), {
			audience,
			issuer: `https://${teamDomain}`
		});

		return {
			audience: getAudience(payload.aud),
			email: typeof payload.email === 'string' ? payload.email : null,
			issuer: typeof payload.iss === 'string' ? payload.iss : `https://${teamDomain}`,
			name:
				typeof payload.name === 'string'
					? payload.name
					: typeof payload.common_name === 'string'
						? payload.common_name
						: null,
			sub: typeof payload.sub === 'string' ? payload.sub : 'unknown'
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Cloudflare Access JWT 校验失败';
		throw new ManageError(401, 'access_unauthorized', message);
	}
}
