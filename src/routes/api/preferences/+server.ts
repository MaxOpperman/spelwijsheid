import { json, type RequestHandler } from '@sveltejs/kit';
import { updatePreferences } from '$lib/server/user';
import { THEME_COOKIE, themeCookieOptions } from '$lib/server/session';

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
	const body = await request.json().catch(() => ({}));

	await updatePreferences(locals.uid, {
		darkMode: body.darkMode,
		locale: body.locale,
		timezone: body.timezone,
		reducedMotion: body.reducedMotion,
		highContrast: body.highContrast,
		soundEnabled: body.soundEnabled,
		onboardingCompleted: body.onboardingCompleted
	});

	if (typeof body.darkMode === 'boolean') {
		cookies.set(THEME_COOKIE, body.darkMode ? 'dark' : 'light', themeCookieOptions);
	}

	return json({ ok: true });
};
