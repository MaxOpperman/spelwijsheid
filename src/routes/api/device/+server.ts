import { json, type RequestHandler } from '@sveltejs/kit';
import { updateDeviceSignals } from '$lib/server/user';

export const POST: RequestHandler = async ({ request, locals }) => {
	// Screen size is analytics data: only store it with analytics consent.
	if (!locals.user.consentAnalytics) {
		return json({ ok: false, reason: 'no-consent' });
	}

	const body = await request.json().catch(() => ({}));

	await updateDeviceSignals(locals.uid, body);

	return json({ ok: true });
};
