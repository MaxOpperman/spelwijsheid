import type { PageServerLoad } from './$types';
import { getWordleWords } from '$lib/words.server.ts';

export const load = (({ cookies }) => {
	const locale = cookies.get('locale') ?? 'en-US';
	const wordList4 = getWordleWords({ exactLength: 4, splitIjDigraph: false, locale });
	const wordList4WithSplitIj = getWordleWords({ exactLength: 4, splitIjDigraph: true, locale });
	const wordList5 = getWordleWords({ exactLength: 5, splitIjDigraph: false, locale });
	const wordList5WithSplitIj = getWordleWords({ exactLength: 5, splitIjDigraph: true, locale });
	const wordList6 = getWordleWords({ exactLength: 6, splitIjDigraph: false, locale });
	const wordList6WithSplitIj = getWordleWords({ exactLength: 6, splitIjDigraph: true, locale });
	const wordList7 = getWordleWords({ exactLength: 7, splitIjDigraph: false, locale });
	const wordList7WithSplitIj = getWordleWords({ exactLength: 7, splitIjDigraph: true, locale });

	return {
		wordList4,
		wordList4WithSplitIj,
		wordList5,
		wordList5WithSplitIj,
		wordList6,
		wordList6WithSplitIj,
		wordList7,
		wordList7WithSplitIj
	};
}) satisfies PageServerLoad;
