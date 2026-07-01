import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { eq, ne, and, or, isNull, gte, desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';

export const prerender = false;

export interface NearbyDevice {
	id: string;
	os: string | null;
	browser: string | null;
	deviceType: string | null;
	lastSeen: Date;
	ipAddress: string | null;
}

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;

	if (!user) {
		throw error(401, 'Unauthorized');
	}

	let matchedUsers: { id: string; matchConfidence: string | null }[] = [];
	if (user.identityId) {
		const siblings = await db
			.select({ id: users.id, matchConfidence: users.matchConfidence })
			.from(users)
			.where(eq(users.identityId, user.identityId));
		matchedUsers = siblings.filter((r) => r.id !== user.id);
	}

	// Other sessions on the same network — anonymised to device-level info only.
	let nearbyDevices: NearbyDevice[] = [];
	if (user.consentAnalytics && user.ip) {
		const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);
		const rows = await db
			.select({
				id: users.id,
				os: users.os,
				browser: users.browser,
				deviceType: users.deviceType,
				lastSeen: users.lastSeen,
				ipAddress: users.ip
			})
			.from(users)
			.where(
				and(
					ne(users.id, user.id),
					eq(users.consentAnalytics, true),
					isNull(users.deletedAt),
					gte(users.lastActiveAt, thirtyDaysAgo),
					// Exclude sessions already merged into the same identity.
					user.identityId
						? or(isNull(users.identityId), ne(users.identityId, user.identityId))
						: undefined,
					eq(users.ip, user.ip)
				)
			)
			.orderBy(desc(users.lastSeen))
			.limit(10);

		nearbyDevices = rows.map((r) => ({
			id: r.id,
			os: r.os,
			browser: r.browser,
			deviceType: r.deviceType,
			lastSeen: r.lastSeen,
			ipAddress: r.ipAddress
		}));
	}

	return {
		user,
		matchedUsers,
		nearbyDevices
	};
};
