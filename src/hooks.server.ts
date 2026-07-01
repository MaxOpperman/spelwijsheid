import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import {
	getOrCreateUser,
	touchLastSeen,
	updateUser,
	recordVisit,
	coupleInstance
} from '$lib/server/user';
import { getClientIp, lookupGeo, parseUserAgent } from '$lib/server/analytics';
import type { User } from '$lib/server/db/schema';
import {
	UID_COOKIE,
	THEME_COOKIE,
	uidCookieOptions,
	themeCookieOptions
} from '$lib/server/session';

export const handle: Handle = async ({ event, resolve }) => {
	// During prerendering (build time) there is no real request and no database.
	if (building) {
		return resolve(event);
	}

	const existingUid = event.cookies.get(UID_COOKIE);
	const user = await getOrCreateUser(existingUid);

	// (Re)issue the persistent cookie so its lifetime keeps rolling forward.
	event.cookies.set(UID_COOKIE, user.id, uidCookieOptions);

	// Readable cookie consumed by the inline theme script in app.html to apply
	// the saved theme before first paint (no flash), even on prerendered pages.
	event.cookies.set(THEME_COOKIE, user.darkMode ? 'dark' : 'light', themeCookieOptions);

	event.locals.uid = user.id;
	event.locals.user = user;

	// Best-effort updates that must not block or fail the request.
	void touchLastSeen(user.id).catch(() => {});

	// Capture analytics only with consent.
	if (user.consentAnalytics) {
		void captureAnalytics(event, user.id).catch(() => {});
	}

	return resolve(event);
};

async function captureAnalytics(
	event: Parameters<Handle>[0]['event'],
	userId: string
): Promise<void> {
	const ip = getClientIp(event.request.headers, event.getClientAddress);
	const ua = parseUserAgent(event.request.headers.get('user-agent'));
	const geo = await lookupGeo(ip);
	const patch: Partial<User> = {
		ip,
		country: geo.country,
		region: geo.region,
		city: geo.city,
		latitude: geo.latitude,
		longitude: geo.longitude,
		browser: ua.browser,
		browserVersion: ua.browserVersion,
		os: ua.os,
		osVersion: ua.osVersion,
		deviceType: ua.deviceType,
		deviceVendor: ua.deviceVendor,
		deviceModel: ua.deviceModel
	};
	// Only set these when present so we keep the first-touch referrer / language
	// rather than nulling them on subsequent requests that omit the header.
	const language = event.request.headers.get('accept-language');
	if (language) patch.languageHeader = language;
	const referrer = event.request.headers.get('referer');
	if (referrer) patch.referrer = referrer;

	await updateUser(userId, patch);
	await recordVisit(userId);
	// Group this instance with other devices/browsers of the same person.
	await coupleInstance(userId);
}
