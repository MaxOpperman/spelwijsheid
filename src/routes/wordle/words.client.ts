import { getWordleWords } from '$lib/words.server.js';

// Get the filtered Dutch words for Wordle
const dutchWords = getWordleWords();

/** The list of possible 5-letter Dutch words for Wordle */
export const words = dutchWords;

/** Set of all allowed 5-letter Dutch words */
export const allowed = new Set(dutchWords);
