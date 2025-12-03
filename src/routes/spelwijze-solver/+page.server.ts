import type { PageServerLoad } from './$types.js';
import { getSolverWords } from '$lib/words.server.js';

export const load = (() => {
	return {
		/**
		 * The list of Dutch words for the solver (with normalized accents)
		 */
		wordList: getSolverWords(),
		/**
		 * The list of Dutch words for the solver (with original accents)
		 */
		wordListWithAccents: getSolverWords({ normalizeAccents: false })
	};
}) satisfies PageServerLoad;
