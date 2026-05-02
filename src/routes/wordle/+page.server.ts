import { fail } from '@sveltejs/kit';
import { Game } from './game.ts';
import type { PageServerLoad, Actions } from './$types';
import { getWordleWords } from '$lib/words.server.ts';
import { parseStats, serializeStats, updateStats } from './stats.ts';
import { LOCALES } from '$lib/stores/locale';

type WordLength = 4 | 5 | 6 | 7;

const WORD_LENGTHS: WordLength[] = [4, 5, 6, 7];

/** Pre-compute word lists for every supported locale and word length. */
const wordListsByLocale: Record<string, Record<WordLength, string[]>> = Object.fromEntries(
	LOCALES.map(({ value: locale }) => [
		locale,
		Object.fromEntries(
			WORD_LENGTHS.map((len) => [len, getWordleWords({ exactLength: len, locale })])
		) as Record<WordLength, string[]>
	])
);

function getWordList(locale: string, wordLength: WordLength): string[] {
	const lists = wordListsByLocale[locale] ?? wordListsByLocale['en-US'];
	return lists[wordLength];
}

export const load = (({ cookies }) => {
	const locale = cookies.get('locale') ?? 'en-US';
	const wordLength = parseInt(cookies.get('wordle-length') || '5') as WordLength;
	const wordList = getWordList(locale, wordLength);
	const game = new Game(cookies.get(`wordle-${locale}-${wordLength}`), wordList, wordLength);
	const stats = parseStats(cookies.get(`wordle-stats-${locale}-${wordLength}`));

	return {
		wordLength,
		guesses: game.guesses,
		answers: game.answers,
		answer: game.answers.length >= 6 ? game.answer : null,
		answerUsesDigraph: game.answer.includes('ĳ'),
		stats
	};
}) satisfies PageServerLoad;

export const actions = {
	update: async ({ request, cookies }) => {
		const locale = cookies.get('locale') ?? 'en-US';
		const wordLength = parseInt(cookies.get('wordle-length') || '5') as WordLength;
		const wordList = getWordList(locale, wordLength);
		const game = new Game(cookies.get(`wordle-${locale}-${wordLength}`), wordList, wordLength);

		const data = await request.formData();
		const key = data.get('key');

		const i = game.answers.length;

		if (key === 'backspace') {
			game.guesses[i] = game.guesses[i].slice(0, -1);
		} else {
			game.guesses[i] += key;
		}

		cookies.set(`wordle-${locale}-${wordLength}`, game.toString(), { path: '/' });
	},

	enter: async ({ request, cookies }) => {
		const locale = cookies.get('locale') ?? 'en-US';
		const wordLength = parseInt(cookies.get('wordle-length') || '5') as WordLength;
		const wordList = getWordList(locale, wordLength);
		const game = new Game(cookies.get(`wordle-${locale}-${wordLength}`), wordList, wordLength);

		const data = await request.formData();
		const guess = data.getAll('guess') as string[];

		if (!game.enter(guess)) {
			return fail(400, { badGuess: true });
		}

		cookies.set(`wordle-${locale}-${wordLength}`, game.toString(), { path: '/' });
	},

	restart: async ({ cookies }) => {
		const locale = cookies.get('locale') ?? 'en-US';
		const wordLength = parseInt(cookies.get('wordle-length') || '5') as WordLength;
		const wordList = getWordList(locale, wordLength);
		const game = new Game(cookies.get(`wordle-${locale}-${wordLength}`), wordList, wordLength);
		const stats = parseStats(cookies.get(`wordle-stats-${locale}-${wordLength}`));

		// Determine if the game was won and how many guesses were used
		const lastAnswer = game.answers.at(-1);
		const won = lastAnswer === 'x'.repeat(wordLength);
		const guessCount = won ? game.answers.length : undefined;

		// Update stats
		const newStats = updateStats(stats, won, guessCount);
		cookies.set(`wordle-stats-${locale}-${wordLength}`, serializeStats(newStats), { path: '/' });

		// Delete the game cookie to start a new game
		cookies.delete(`wordle-${locale}-${wordLength}`, { path: '/' });
	},

	changeLength: async ({ request, cookies }) => {
		const data = await request.formData();
		const newLength = data.get('length');
		cookies.set('wordle-length', String(newLength), { path: '/' });
	}
} satisfies Actions;
