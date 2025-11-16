// Client-side Dutch words for Wordle
// Words are passed from the server via page data

/**
 * Create words and allowed set from the provided word list
 */
export function createWordData(wordList: string[]) {
	return {
		words: wordList,
		allowed: new Set(wordList)
	};
}
