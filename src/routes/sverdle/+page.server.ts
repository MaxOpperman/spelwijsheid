import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types.ts';
import { readFileSync } from 'fs';
import path from 'path';
import { Game } from './game.ts';

// Load the word list from the `index.dic` file in the `dictionary-nl` package
const filePath = path.resolve('node_modules/dictionary-nl/index.dic');
const fileContent = readFileSync(filePath, 'utf-8');
const wordList = fileContent
	.split('\n')
	.map(line => line.split('/')[0].trim()) // Extract words before any metadata
	.filter(word => {
		if (word.length === 0) return false; // Remove empty lines
		
		// Count characters, treating 'ij' as a single character
		const charCount = word.replace(/ij/g, 'x').length; // Replace 'ij' with single char for counting
		return charCount >= 4; // Only words with at least 4 characters
	});

export const load = (({ cookies }) => {
	const game = new Game(cookies.get('sverdle'));

	return {
		/**
		 * The player's guessed words so far
		 */
		guesses: game.guesses,

		/**
		 * An array of strings like '__x_c' corresponding to the guesses, where 'x' means
		 * an exact match, and 'c' means a close match (right letter, wrong place)
		 */
		answers: game.answers,

		/**
		 * The correct answer, revealed if the game is over
		 */
		answer: game.answers.length >= 6 ? game.answer : null,

		/**
		 * The list of possible words
		 */
		wordList // Pass the word list to the client
	};
}) satisfies PageServerLoad;

export const actions = {
	/**
	 * Modify game state in reaction to a keypress. If client-side JavaScript
	 * is available, this will happen in the browser instead of here
	 */
	update: async ({ request, cookies }) => {
		const game = new Game(cookies.get('sverdle'));

		const data = await request.formData();
		const key = data.get('key');

		const i = game.answers.length;

		if (key === 'backspace') {
			game.guesses[i] = game.guesses[i].slice(0, -1);
		} else {
			game.guesses[i] += key;
		}

		cookies.set('sverdle', game.toString(), { path: '/' });
	},

	/**
	 * Modify game state in reaction to a guessed word. This logic always runs on
	 * the server, so that people can't cheat by peeking at the JavaScript
	 */
	enter: async ({ request, cookies }) => {
		const game = new Game(cookies.get('sverdle'));

		const data = await request.formData();
		const guess = data.getAll('guess') as string[];

		if (!game.enter(guess)) {
			return fail(400, { badGuess: true });
		}

		cookies.set('sverdle', game.toString(), { path: '/' });
	},

	restart: async ({ cookies }) => {
		cookies.delete('sverdle', { path: '/' });
	}
} satisfies Actions;
