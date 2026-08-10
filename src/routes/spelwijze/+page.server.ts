import type { PageServerLoad } from './$types.js';
import { getSolverWords } from '$lib/words.server.js';
import { getLocale } from '$lib/server/word-games';

export const load = (({ cookies }) => {
	const locale = getLocale(cookies);
	return {
		/**
		 * The list of words for the Spelwijze game, selected based on the user's locale.
		 */
		wordList: getSolverWords({ locale }),
		locale
	};
}) satisfies PageServerLoad;
