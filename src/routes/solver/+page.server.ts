import type { PageServerLoad } from './$types.js';
import { readFileSync } from 'fs';
import path from 'path';

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

export const load = (() => {
	return {
		/**
		 * The list of Dutch words for the solver
		 */
		wordList
	};
}) satisfies PageServerLoad;
