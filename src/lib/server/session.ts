/** Name of the persistent user-identifier cookie. */
export const UID_COOKIE = 'uid';

/** Readable cookie mirroring the saved theme, used by the inline theme script. */
export const THEME_COOKIE = 'theme';

/**
 * Version tag for the current consent copy. Bump this whenever the consent
 * wording or the categories of data collected change, so stored consent can be
 * matched against the policy the user actually agreed to.
 */
export const CONSENT_VERSION = '2026-07-01';

/** How long analytics data may be retained after the last consent decision. */
export const DATA_RETENTION_DAYS = 365;

/**
 * Persistent UUID cookie options. Max-Age is capped at ~400 days by modern
 * browsers (Chrome), so we use that ceiling to keep the session as durable as
 * possible.
 */
export const UID_COOKIE_MAX_AGE = 400 * 24 * 60 * 60; // seconds

export const uidCookieOptions = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax' as const,
	secure: process.env.NODE_ENV === 'production',
	maxAge: UID_COOKIE_MAX_AGE
};

/**
 * Theme cookie is readable by client JS (not httpOnly) so the inline script in
 * app.html can apply the saved theme before first paint.
 */
export const themeCookieOptions = {
	path: '/',
	httpOnly: false,
	sameSite: 'lax' as const,
	secure: process.env.NODE_ENV === 'production',
	maxAge: UID_COOKIE_MAX_AGE
};
