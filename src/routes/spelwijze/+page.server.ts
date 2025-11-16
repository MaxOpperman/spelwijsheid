import type { PageServerLoad } from './$types.js';
import { getSolverWords } from '$lib/words.server.js';

export const load = (() => {
	return {
		/**
		 * The list of Dutch words for the Spelwijze
		 */
		wordList: getSolverWords()
	};
}) satisfies PageServerLoad;
