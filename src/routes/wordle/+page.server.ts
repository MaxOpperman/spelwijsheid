import { fail } from '@sveltejs/kit';
import { Game } from './game.ts';
import type { PageServerLoad, Actions } from './$types';
import { getWordleWords } from '$lib/words.server.ts';
import { parseStats, serializeStats, updateStats } from './stats.ts';
import { LOCALES } from '$lib/stores/locale';
import { getGameState, setGameState, clearGameState, recordGameResult } from '$lib/server/user';

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

/** Server-side storage key suffix combining locale and word length. */
function key(locale: string, wordLength: WordLength): string {
	return `${locale}-${wordLength}`;
}

export const load = (async ({ cookies, locals }) => {
	const locale = locals.user?.locale ?? cookies.get('locale') ?? 'en-US';
	const wordLength = parseInt(cookies.get('wordle-length') || '5') as WordLength;
	const wordList = getWordList(locale, wordLength);

	const savedGame = await getGameState<string>(locals.uid, 'wordle', key(locale, wordLength));
	const savedStats = await getGameState<string>(
		locals.uid,
		'wordle-stats',
		key(locale, wordLength)
	);

	const game = new Game(savedGame ?? undefined, wordList, wordLength);
	const stats = parseStats(savedStats ?? undefined);

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
	update: async ({ request, cookies, locals }) => {
		const locale = locals.user?.locale ?? cookies.get('locale') ?? 'en-US';
		const wordLength = parseInt(cookies.get('wordle-length') || '5') as WordLength;
		const wordList = getWordList(locale, wordLength);
		const savedGame = await getGameState<string>(locals.uid, 'wordle', key(locale, wordLength));
		const game = new Game(savedGame ?? undefined, wordList, wordLength);

		const data = await request.formData();
		const keyPress = data.get('key');
		if (typeof keyPress !== 'string' || !keyPress) {
			return fail(400, { badGuess: true });
		}

		const i = game.answers.length;

		if (keyPress === 'backspace') {
			game.guesses[i] = game.guesses[i].slice(0, -1);
		} else {
			game.guesses[i] += keyPress;
		}

		await setGameState(locals.uid, 'wordle', game.toString(), key(locale, wordLength));
	},

	enter: async ({ request, cookies, locals }) => {
		const locale = locals.user?.locale ?? cookies.get('locale') ?? 'en-US';
		const wordLength = parseInt(cookies.get('wordle-length') || '5') as WordLength;
		const wordList = getWordList(locale, wordLength);
		const savedGame = await getGameState<string>(locals.uid, 'wordle', key(locale, wordLength));
		const game = new Game(savedGame ?? undefined, wordList, wordLength);

		const data = await request.formData();
		const guess = data.getAll('guess') as string[];

		if (!game.enter(guess)) {
			return fail(400, { badGuess: true });
		}

		await setGameState(locals.uid, 'wordle', game.toString(), key(locale, wordLength));
	},

	restart: async ({ cookies, locals }) => {
		const locale = locals.user?.locale ?? cookies.get('locale') ?? 'en-US';
		const wordLength = parseInt(cookies.get('wordle-length') || '5') as WordLength;
		const wordList = getWordList(locale, wordLength);
		const savedGame = await getGameState<string>(locals.uid, 'wordle', key(locale, wordLength));
		const savedStats = await getGameState<string>(
			locals.uid,
			'wordle-stats',
			key(locale, wordLength)
		);
		const game = new Game(savedGame ?? undefined, wordList, wordLength);
		const stats = parseStats(savedStats ?? undefined);

		// Determine if the game was won and how many guesses were used
		const lastAnswer = game.answers.at(-1);
		const won = lastAnswer === 'x'.repeat(wordLength);
		const guessCount = won ? game.answers.length : undefined;

		// Update stats and persist them server-side
		const newStats = updateStats(stats, won, guessCount);
		await setGameState(
			locals.uid,
			'wordle-stats',
			serializeStats(newStats),
			key(locale, wordLength)
		);

		// Record a result row for unified analytics (Wordle is untimed).
		await recordGameResult({
			userId: locals.uid,
			game: 'wordle',
			locale: key(locale, wordLength),
			won
		});

		// Clear the saved board to start a new game
		await clearGameState(locals.uid, 'wordle', key(locale, wordLength));
	},

	changeLength: async ({ request, cookies }) => {
		const data = await request.formData();
		const newLength = data.get('length');
		cookies.set('wordle-length', String(newLength), { path: '/' });
	}
} satisfies Actions;
