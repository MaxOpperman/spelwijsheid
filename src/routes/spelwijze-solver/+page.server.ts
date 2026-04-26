import type { PageServerLoad } from './$types.js';
import { getSolverWords } from '$lib/words.server.js';

export const load = (({ cookies }) => {
	const locale = cookies.get('locale') ?? 'en-US';
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
