/**
 * Capitalizes the first character of a string.
 * @param word - The string to capitalize
 * @returns The string with the first character converted to uppercase
 * @example
 * capitalizeFirstChar("hello") // Returns "Hello"
 * capitalizeFirstChar("") // Returns ""
 */
export function capitalizeFirstChar(word: string | null): string {
	if (!word) return '';
	return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Computes the Levenshtein edit distance between two strings.
 * The edit distance is the minimum number of single-character edits
 * (insertions, deletions, or substitutions) required to transform one string into the other.
 * @param a - The first string
 * @param b - The second string
 * @returns The edit distance between `a` and `b`
 * @example
 * editDistance("mirror", "miror") // Returns 1
 * editDistance("cat", "cat")     // Returns 0
 * https://en.wikipedia.org/wiki/Levenshtein_distance
 */
function editDistance(a: string, b: string): number {
	const m = a.length,
		n = b.length;
	const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
		Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
	);
	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			dp[i][j] =
				a[i - 1] === b[j - 1]
					? dp[i - 1][j - 1]
					: 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
		}
	}
	return dp[m][n];
}

/**
 * Returns the number of typos (edit distance) that are tolerated for a given answer.
 * Tolerance scales with word length to be lenient on longer words:
 * - <= 4 characters: 0 (exact match required)
 * - 5-7 characters: 1 (one typo allowed)
 * - 8+ characters: 2 (two typos allowed)
 * Whitespace is excluded from the length calculation.
 * @param word - The correct answer to compute the tolerance for
 * @returns The maximum allowed edit distance
 * @example
 * allowedDistance("cat")      // Returns 0
 * allowedDistance("mirror")   // Returns 1
 * allowedDistance("elephant") // Returns 2
 */
function allowedDistance(word: string): number {
	const len = word.replace(/\s+/g, '').length;
	if (len <= 4) return 0;
	if (len <= 7) return 1;
	return 2;
}

/**
 * Determines whether a guess is close enough to the correct answer,
 * allowing for a small number of typos based on the answer's length.
 * Both strings are trimmed and lowercased before comparison.
 * @param guess - The player's guess
 * @param answer - The correct answer
 * @returns `true` if the guess is within the allowed edit distance of the answer
 * @example
 * isCorrectGuess("miror", "mirror")   // Returns true  (1 typo, length 6 → tolerance 1)
 * isCorrectGuess("cat", "car")        // Returns false (1 typo, length 3 → tolerance 0)
 * isCorrectGuess("elefant", "elephant") // Returns true (2 typos, length 8 → tolerance 2)
 */
export function isCorrectGuess(guess: string, answer: string): boolean {
	const g = guess.toLowerCase().trim();
	const a = answer.toLowerCase().trim();
	return editDistance(g, a) <= allowedDistance(a);
}
