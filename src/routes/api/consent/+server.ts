import { json, type RequestHandler } from '@sveltejs/kit';
import { setConsent, unlinkInstance } from '$lib/server/user';

export const POST: RequestHandler = async ({ request, locals }) => {
	const body = await request.json().catch(() => ({}));

	const functional = body.functional !== false; // functional is essential
	const analytics = body.analytics === true;

	await setConsent(locals.uid, { functional, analytics });

	// Withdrawing analytics consent also breaks any cross-device coupling.
	if (!analytics) {
		await unlinkInstance(locals.uid);
	}

	return json({ ok: true, functional, analytics });
};
