import type { PageServerLoad } from './$types.js';
import { getWordleWords } from '$lib/words.server.js';

export const load = (() => {
	return {
		/**
		 * The list of Dutch words for the Wordle
		 */
		wordList: getWordleWords()
	};
}) satisfies PageServerLoad;
