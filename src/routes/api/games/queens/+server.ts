import { json, type RequestHandler } from '@sveltejs/kit';
import { getGameState, setGameState, clearGameState, recordGameResult } from '$lib/server/user';

interface QueensMeta {
	pausedTime: number;
	lastCompletionTime: number | null;
}

interface LeaderboardEntry {
	size: number;
	time: number;
	date: string;
}

const DEFAULT_META: QueensMeta = { pausedTime: 0, lastCompletionTime: null };

export const GET: RequestHandler = async ({ locals }) => {
	const [game, meta, leaderboard] = await Promise.all([
		getGameState<string>(locals.uid, 'queens'),
		getGameState<QueensMeta>(locals.uid, 'queens-meta'),
		getGameState<LeaderboardEntry[]>(locals.uid, 'queens-leaderboard')
	]);
	return json({
		game: game ?? null,
		meta: meta ?? DEFAULT_META,
		leaderboard: leaderboard ?? []
	});
};

export const POST: RequestHandler = async ({ locals, request }) => {
	const body = await request.json().catch(() => ({}));

	switch (body.type) {
		case 'save': {
			if (typeof body.game === 'string') {
				await setGameState(locals.uid, 'queens', body.game);
			}
			break;
		}
		case 'pause': {
			const meta = (await getGameState<QueensMeta>(locals.uid, 'queens-meta')) ?? DEFAULT_META;
			await setGameState(locals.uid, 'queens-meta', {
				...meta,
				pausedTime: Number(body.pausedTime) || 0
			});
			break;
		}
		case 'new': {
			await clearGameState(locals.uid, 'queens');
			await setGameState(locals.uid, 'queens-meta', { pausedTime: 0, lastCompletionTime: null });
			if (typeof body.game === 'string') {
				await setGameState(locals.uid, 'queens', body.game);
			}
			break;
		}
		case 'complete': {
			const size = Number(body.size);
			const time = Number(body.time);
			if (!Number.isFinite(size) || size <= 0 || !Number.isFinite(time) || time < 0) {
				return json({ ok: false }, { status: 400 });
			}
			if (typeof body.game === 'string') {
				await setGameState(locals.uid, 'queens', body.game);
			}
			await setGameState(locals.uid, 'queens-meta', {
				pausedTime: 0,
				lastCompletionTime: time
			});
			const leaderboard =
				(await getGameState<LeaderboardEntry[]>(locals.uid, 'queens-leaderboard')) ?? [];
			leaderboard.push({ size, time, date: new Date().toISOString() });
			await setGameState(locals.uid, 'queens-leaderboard', leaderboard);
			// Record a timed result for unified average-time analytics.
			await recordGameResult({
				userId: locals.uid,
				game: 'queens',
				locale: String(size),
				won: true,
				durationMs: Math.round(time * 1000)
			});
			break;
		}
	}

	return json({ ok: true });
};
