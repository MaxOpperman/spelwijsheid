import { fail } from '@sveltejs/kit';
import { Game } from './game.ts';
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
	const wordLength = parseInt(cookies.get('wordle-length') || '5') as 4 | 5 | 6 | 7;
	const wordList = wordLists[wordLength];
	const game = new Game(cookies.get(`wordle-${wordLength}`), wordList, wordLength);
	const stats = parseStats(cookies.get(`wordle-stats-${wordLength}`));

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
		const wordLength = parseInt(cookies.get('wordle-length') || '5') as 4 | 5 | 6 | 7;
		const wordList = wordLists[wordLength];
		const game = new Game(cookies.get(`wordle-${wordLength}`), wordList, wordLength);

		const data = await request.formData();
		const key = data.get('key');

		const i = game.answers.length;

		if (key === 'backspace') {
			game.guesses[i] = game.guesses[i].slice(0, -1);
		} else {
			game.guesses[i] += key;
		}

		cookies.set(`wordle-${wordLength}`, game.toString(), { path: '/' });
	},

	enter: async ({ request, cookies }) => {
		const wordLength = parseInt(cookies.get('wordle-length') || '5') as 4 | 5 | 6 | 7;
		const wordList = wordLists[wordLength];
		const game = new Game(cookies.get(`wordle-${wordLength}`), wordList, wordLength);

		const data = await request.formData();
		const guess = data.getAll('guess') as string[];

		if (!game.enter(guess)) {
			return fail(400, { badGuess: true });
		}

		cookies.set(`wordle-${wordLength}`, game.toString(), { path: '/' });
	},

	restart: async ({ cookies }) => {
		const wordLength = parseInt(cookies.get('wordle-length') || '5') as 4 | 5 | 6 | 7;
		const wordList = wordLists[wordLength];
		const game = new Game(cookies.get(`wordle-${wordLength}`), wordList, wordLength);
		const stats = parseStats(cookies.get(`wordle-stats-${wordLength}`));

		// Determine if the game was won and how many guesses were used
		const lastAnswer = game.answers.at(-1);
		const won = lastAnswer === 'x'.repeat(wordLength);
		const guessCount = won ? game.answers.length : undefined;

		// Update stats
		const newStats = updateStats(stats, won, guessCount);
		cookies.set(`wordle-stats-${wordLength}`, serializeStats(newStats), { path: '/' });

		// Delete the game cookie to start a new game
		cookies.delete(`wordle-${wordLength}`, { path: '/' });
	},

	changeLength: async ({ request, cookies }) => {
		const data = await request.formData();
		const newLength = data.get('length');
		cookies.set('wordle-length', String(newLength), { path: '/' });
	}
} satisfies Actions;
