import { getWordleWords } from '$lib/words.server.ts';
import { WORD_LENGTHS, getLocale, type WordLength } from '$lib/server/word-games';
import type { Cookies } from '@sveltejs/kit';

export function getSolverLists(cookies: Cookies) {
	const locale = getLocale(cookies);
	const lists = Object.fromEntries(
		WORD_LENGTHS.map((wordLength) => [
			wordLength,
			{
				plain: getWordleWords({ exactLength: wordLength, splitIjDigraph: false, locale }),
				splitIj: getWordleWords({ exactLength: wordLength, splitIjDigraph: true, locale })
			}
		])
	) as Record<WordLength, { plain: string[]; splitIj: string[] }>;

	return { locale, lists };
}
