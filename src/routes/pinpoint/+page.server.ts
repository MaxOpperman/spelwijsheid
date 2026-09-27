import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { applyGuess, endGame, getLoadState, startNewGame } from './logic.ts';
import { getSession } from './game-store.ts';

export const prerender = false;

export const load = (async ({ locals }) => {
	return getLoadState(getSession(locals.uid));
}) satisfies PageServerLoad;

export const actions = {
	startGame: async ({ cookies, locals }) => {
		try {
			await startNewGame(cookies, locals.uid);
		} catch {
			return fail(503, { generationFailed: true });
		}
	},

	guess: async ({ request, locals }) => {
		const formData = await request.formData();
		await applyGuess(locals.uid, formData.get('guess'));
	},

	pausePlaying: async ({ locals }) => {
		endGame(locals.uid);
	},

	newGame: async ({ cookies, locals }) => {
		try {
			await startNewGame(cookies, locals.uid);
		} catch {
			return fail(503, { generationFailed: true });
		}
	}
} satisfies Actions;
