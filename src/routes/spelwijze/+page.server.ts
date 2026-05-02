import type { PageServerLoad } from './$types.js';
import { getSolverWords } from '$lib/words.server.js';

export const load = (({ cookies }) => {
	const locale = cookies.get('locale') ?? 'en-US';
	return {
		/**
		 * The list of words for the Spelwijze game, selected based on the user's locale.
		 */
		wordList: getSolverWords({ locale }),
		locale
	};
}) satisfies PageServerLoad;
