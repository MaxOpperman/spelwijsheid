import type { PageServerLoad } from './$types';
import { getWordleWords } from '$lib/words.server.ts';

export const load = (() => {
	const wordList4 = getWordleWords({ exactLength: 4 });
	const wordList5 = getWordleWords({ exactLength: 5 });
	const wordList6 = getWordleWords({ exactLength: 6 });
	const wordList7 = getWordleWords({ exactLength: 7 });

	return {
		wordList4,
		wordList5,
		wordList6,
		wordList7
	};
}) satisfies PageServerLoad;
