import { json, type RequestHandler } from '@sveltejs/kit';
import { getGameState, setGameState } from '$lib/server/user';

function localeKey(url: URL): string {
	return url.searchParams.get('locale') ?? 'en-US';
}

export const GET: RequestHandler = async ({ locals, url }) => {
	const state = await getGameState(locals.uid, 'spelwijze', localeKey(url));
	return json({ state: state ?? null });
};

export const POST: RequestHandler = async ({ locals, url, request }) => {
	const body = await request.json().catch(() => null);
	if (body == null) {
		return json({ ok: false }, { status: 400 });
	}
	await setGameState(locals.uid, 'spelwijze', body, localeKey(url));
	return json({ ok: true });
};
