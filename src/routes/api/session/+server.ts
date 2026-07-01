import { json, type RequestHandler } from '@sveltejs/kit';
import { getEffectivePreferences } from '$lib/server/user';

/**
 * Lightweight session bootstrap. Hitting this dynamic endpoint guarantees the
 * `uid` cookie is created (via hooks.server.ts) even when the visited page was
 * prerendered. Returns the current preferences/consent state for the client.
 */
export const GET: RequestHandler = async ({ locals }) => {
	const u = locals.user;
	// Merge in shared preferences from a strong cross-device match, if any.
	const prefs = await getEffectivePreferences(u);
	return json({
		darkMode: prefs.darkMode,
		locale: prefs.locale,
		timezone: u.timezone,
		reducedMotion: prefs.reducedMotion,
		highContrast: prefs.highContrast,
		soundEnabled: prefs.soundEnabled,
		onboardingCompleted: u.onboardingCompleted,
		consentDecided: u.consentUpdatedAt != null,
		consentFunctional: u.consentFunctional,
		consentAnalytics: u.consentAnalytics
	});
};
