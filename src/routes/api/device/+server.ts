import { json, type RequestHandler } from '@sveltejs/kit';
import { updateUser, coupleInstance } from '$lib/server/user';

function toInt(value: unknown): number | undefined {
	const n = Number(value);
	return Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
}

function toFloat(value: unknown): number | undefined {
	const n = Number(value);
	return Number.isFinite(n) && n > 0 ? n : undefined;
}

export const POST: RequestHandler = async ({ request, locals }) => {
	// Screen size is analytics data: only store it with analytics consent.
	if (!locals.user.consentAnalytics) {
		return json({ ok: false, reason: 'no-consent' });
	}

	const body = await request.json().catch(() => ({}));

	await updateUser(locals.uid, {
		screenW: toInt(body.screenW) ?? null,
		screenH: toInt(body.screenH) ?? null,
		viewportW: toInt(body.viewportW) ?? null,
		viewportH: toInt(body.viewportH) ?? null,
		dpr: toFloat(body.dpr) ?? null,
		colorScheme: typeof body.colorScheme === 'string' ? body.colorScheme : null
	});

	// Screen/DPR/color-scheme sharpen the fingerprint, so re-couple.
	await coupleInstance(locals.uid);

	return json({ ok: true });
};
