import type { PageServerLoad } from './$types.js';
import { getSolverWords } from '$lib/words.server.js';

export const load = (() => {
	return {
		/**
		 * The list of Dutch words for the solver
		 */
		wordList: getSolverWords()
	};
}) satisfies PageServerLoad;
