import { json, type RequestHandler } from '@sveltejs/kit';
import { setDarkMode, setLocale, setFunctionalPreferences } from '$lib/server/user';
import { THEME_COOKIE, themeCookieOptions } from '$lib/server/session';

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
	const body = await request.json().catch(() => ({}));

	if (typeof body.darkMode === 'boolean') {
		await setDarkMode(locals.uid, body.darkMode);
		cookies.set(THEME_COOKIE, body.darkMode ? 'dark' : 'light', themeCookieOptions);
	}

	if (typeof body.locale === 'string') {
		await setLocale(locals.uid, body.locale);
	}

	// Functional preferences are essential — stored without analytics consent.
	await setFunctionalPreferences(locals.uid, {
		timezone: body.timezone,
		reducedMotion: body.reducedMotion,
		highContrast: body.highContrast,
		soundEnabled: body.soundEnabled,
		onboardingCompleted: body.onboardingCompleted
	});

	return json({ ok: true });
};
