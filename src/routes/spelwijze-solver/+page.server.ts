import type { PageServerLoad } from './$types.js';
import { getSolverWords } from '$lib/words.server.js';
import { getLocale } from '$lib/server/word-games';

export const load = (({ cookies }) => {
	const locale = getLocale(cookies);
	return {
		/**
		 * The list of words for the solver (with normalized accents), selected based on the user's locale.
		 */
		wordList: getSolverWords({ locale }),
		/**
		 * The list of words for the solver (with original accents), selected based on the user's locale.
		 */
		wordListWithAccents: getSolverWords({ locale, normalizeAccents: false })
	};
}) satisfies PageServerLoad;
