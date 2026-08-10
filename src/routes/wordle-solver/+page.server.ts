import type { PageServerLoad } from './$types';
import { getSolverLists } from './lists';

export const load = (({ cookies }) => {
	const { lists } = getSolverLists(cookies);
	return {
		wordList4: lists[4].plain,
		wordList4WithSplitIj: lists[4].splitIj,
		wordList5: lists[5].plain,
		wordList5WithSplitIj: lists[5].splitIj,
		wordList6: lists[6].plain,
		wordList6WithSplitIj: lists[6].splitIj,
		wordList7: lists[7].plain,
		wordList7WithSplitIj: lists[7].splitIj
	};
}) satisfies PageServerLoad;
