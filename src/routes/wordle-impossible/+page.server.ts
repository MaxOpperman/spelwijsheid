import { fail } from '@sveltejs/kit';
import { ImpossibleGame } from './game.ts';
import type { PageServerLoad, Actions } from './$types';
import { getWordleWords } from '$lib/words.server.ts';
import { parseStats, serializeStats, updateStats } from './stats.ts';

const wordLists = {
	4: getWordleWords({ exactLength: 4 }),
	5: getWordleWords({ exactLength: 5 }),
	6: getWordleWords({ exactLength: 6 }),
	7: getWordleWords({ exactLength: 7 })
};

export const load = (({ cookies }) => {
	const wordLength = parseInt(cookies.get('wordle-impossible-length') || '5') as 4 | 5 | 6 | 7;
	const wordList = wordLists[wordLength];
	const game = new ImpossibleGame(
		cookies.get(`wordle-impossible-${wordLength}`),
		wordList,
		wordLength
	);
	const stats = parseStats(cookies.get(`wordle-impossible-stats-${wordLength}`));

	return {
		wordLength,
		guesses: game.guesses,
		answers: game.answers,
		answer: game.isWon() ? game.getCurrentAnswer() : null,
		startTime: game.startTime,
		endTime: game.endTime,
		stats
	};
}) satisfies PageServerLoad;

export const actions = {
	update: async ({ request, cookies }) => {
		const wordLength = parseInt(cookies.get('wordle-impossible-length') || '5') as 4 | 5 | 6 | 7;
		const wordList = wordLists[wordLength];
		const game = new ImpossibleGame(
			cookies.get(`wordle-impossible-${wordLength}`),
			wordList,
			wordLength
		);

		const data = await request.formData();
		const key = data.get('key');

		const i = game.guesses.length;
		const currentGuess = game.guesses[i] || '';

		if (key === 'backspace') {
			// Store the updated current guess
			if (i < game.guesses.length) {
				game.guesses[i] = currentGuess.slice(0, -1);
			}
		} else {
			// Store the updated current guess
			if (i < game.guesses.length) {
				game.guesses[i] = currentGuess + key;
			}
		}

		cookies.set(`wordle-impossible-${wordLength}`, game.toString(), { path: '/' });
	},

	enter: async ({ request, cookies }) => {
		const wordLength = parseInt(cookies.get('wordle-impossible-length') || '5') as 4 | 5 | 6 | 7;
		const wordList = wordLists[wordLength];
		const game = new ImpossibleGame(
			cookies.get(`wordle-impossible-${wordLength}`),
			wordList,
			wordLength
		);

		const data = await request.formData();
		const guess = data.getAll('guess') as string[];

		if (!game.enter(guess)) {
			return fail(400, { badGuess: true });
		}

		cookies.set(`wordle-impossible-${wordLength}`, game.toString(), { path: '/' });
	},

	restart: async ({ cookies }) => {
		const wordLength = parseInt(cookies.get('wordle-impossible-length') || '5') as 4 | 5 | 6 | 7;
		const wordList = wordLists[wordLength];
		const game = new ImpossibleGame(
			cookies.get(`wordle-impossible-${wordLength}`),
			wordList,
			wordLength
		);
		const stats = parseStats(cookies.get(`wordle-impossible-stats-${wordLength}`));

		// Determine if the game was won and calculate time
		const won = game.isWon();
		const timeMs = game.getElapsedTime();

		// Update stats
		const newStats = updateStats(stats, won, timeMs);
		cookies.set(`wordle-impossible-stats-${wordLength}`, serializeStats(newStats), { path: '/' });

		// Delete the game cookie to start a new game
		cookies.delete(`wordle-impossible-${wordLength}`, { path: '/' });
	},

	changeLength: async ({ request, cookies }) => {
		const data = await request.formData();
		const newLength = data.get('length');
		cookies.set('wordle-impossible-length', String(newLength), { path: '/' });
	}
} satisfies Actions;
