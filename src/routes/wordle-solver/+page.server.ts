import type { PageServerLoad } from './$types';
import { getWordleWords } from '$lib/words.server.ts';

export const load = (() => {
	const wordList = getWordleWords({ splitIjDigraph: false });
	const wordListWithSplitIj = getWordleWords({ splitIjDigraph: true });

	return {
		wordList,
		wordListWithSplitIj
	};
}) satisfies PageServerLoad;
