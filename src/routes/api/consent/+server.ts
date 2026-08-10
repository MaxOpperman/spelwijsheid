import { json, type RequestHandler } from '@sveltejs/kit';
import { setConsentAndUnlinkInstance } from '$lib/server/user';

export const POST: RequestHandler = async ({ request, locals }) => {
	const body = await request.json().catch(() => ({}));

	const functional = body.functional !== false; // functional is essential
	const analytics = body.analytics === true;

	await setConsentAndUnlinkInstance(locals.uid, { functional, analytics });

	return json({ ok: true, functional, analytics });
};
