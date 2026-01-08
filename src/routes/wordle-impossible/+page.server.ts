import { fail } from '@sveltejs/kit';
import { ImpossibleGame } from './game.ts';
import type { PageServerLoad, Actions } from './$types';
import { getWordleWords } from '$lib/words.server.ts';
import { parseStats, serializeStats, updateStats } from './stats.ts';

const wordLists = {
	4: getWordleWords({
		exactLength: 4,
		splitIjDigraph: true,
		lowercase: true,
		excludeRomanNumeral: true
	}),
	5: getWordleWords({
		exactLength: 5,
		splitIjDigraph: true,
		lowercase: true,
		excludeRomanNumeral: true
	}),
	6: getWordleWords({
		exactLength: 6,
		splitIjDigraph: true,
		lowercase: true,
		excludeRomanNumeral: true
	}),
	7: getWordleWords({
		exactLength: 7,
		splitIjDigraph: true,
		lowercase: true,
		excludeRomanNumeral: true
	})
};

export const load = (({ cookies }) => {
	const wordLength = parseInt(cookies.get('wordle-impossible-length') || '5') as 4 | 5 | 6 | 7;
	const wordList = wordLists[wordLength];
	const game = new ImpossibleGame(
		cookies.get(`wordle-impossible-${wordLength}`),
		wordList,
		wordLength
	);
	let stats = parseStats(cookies.get(`wordle-impossible-stats-${wordLength}`));

	// If the game just ended, check if we need to update stats
	if (game.endTime && game.guesses.length > 0) {
		const lastRecordedGame = cookies.get(`wordle-impossible-last-recorded-${wordLength}`);
		// Create a more robust game ID that includes:
		// - startTime: when the game began
		// - endTime: when the game finished
		// - guessCount: number of guesses made (prevents duplicate entries if times match)
		// - first/last guess: adds uniqueness based on actual game content
		const currentGameId = `${game.startTime}-${game.endTime}-${game.guesses.length}-${game.guesses[0]}-${game.guesses[game.guesses.length - 1]}`;

		// Only update stats if this game hasn't been recorded yet
		if (lastRecordedGame !== currentGameId) {
			const won = game.isWon();
			const timeMs = game.getElapsedTime();
			const guessCount = won ? game.guesses.length : undefined;
			stats = updateStats(stats, won, timeMs, guessCount);
			cookies.set(`wordle-impossible-stats-${wordLength}`, serializeStats(stats), { path: '/' });
			cookies.set(`wordle-impossible-last-recorded-${wordLength}`, currentGameId, { path: '/' });
		}
	}

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

		// Delete the game cookie to start a new game
		cookies.delete(`wordle-impossible-${wordLength}`, { path: '/' });
		// Also delete the last recorded game ID so a new game can be tracked
		cookies.delete(`wordle-impossible-last-recorded-${wordLength}`, { path: '/' });
	},

	changeLength: async ({ request, cookies }) => {
		const data = await request.formData();
		const newLength = data.get('length');
		cookies.set('wordle-impossible-length', String(newLength), { path: '/' });
	}
} satisfies Actions;
