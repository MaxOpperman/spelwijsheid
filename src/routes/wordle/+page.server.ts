import type { PageServerLoad } from './$types';
import { getWordleWords } from '$lib/words.server.ts';

export const load = (() => {
	const wordList = getWordleWords();

	return {
		wordList
	};
}) satisfies PageServerLoad;