import type { Actions, PageServerLoad } from './$types';
import { applyGuess, endGame, getLoadState, startNewGame } from './logic.ts';
import { getSession } from './game-store.ts';

export const prerender = false;

export const load = (async ({ locals }) => {
	return getLoadState(getSession(locals.uid));
}) satisfies PageServerLoad;

export const actions = {
	startGame: async ({ cookies, locals }) => {
		await startNewGame(cookies, locals.uid);
	},

	guess: async ({ request, locals }) => {
		const formData = await request.formData();
		await applyGuess(locals.uid, formData.get('guess'));
	},

	pausePlaying: async ({ locals }) => {
		endGame(locals.uid);
	},

	newGame: async ({ cookies, locals }) => {
		endGame(locals.uid);
		await startNewGame(cookies, locals.uid);
	}
} satisfies Actions;
