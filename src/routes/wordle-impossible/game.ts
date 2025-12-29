export class ImpossibleGame {
	guesses: string[];
	answers: string[];
	wordList: string[];
	possibleWords: string[];
	wordLength: number;
	startTime: number;
	endTime?: number;

	/**
	 * Create an impossible game object from the player's cookie, or initialise a new game
	 */
	constructor(serialized: string | undefined, wordList: string[], wordLength: number = 5) {
		this.wordList = wordList;
		this.wordLength = wordLength;

		if (serialized) {
			const parts = serialized.split('-');
			const startTimeStr = parts[0];
			const guessesStr = parts[1];
			const answersStr = parts[2];
			const endTimeStr = parts[3];

			this.startTime = parseInt(startTimeStr);
			this.guesses = guessesStr ? guessesStr.split(' ') : [];
			this.answers = answersStr ? answersStr.split(' ') : [];
			this.endTime = endTimeStr ? parseInt(endTimeStr) : undefined;

			// Rebuild possible words from guesses/answers
			this.possibleWords = this.filterPossibleWords(wordList, this.guesses, this.answers);
		} else {
			this.startTime = Date.now();
			this.guesses = [];
			this.answers = [];
			this.possibleWords = [...wordList];
		}
	}

	/**
	 * Filter word list based on previous guesses and answers
	 */
	private filterPossibleWords(words: string[], guesses: string[], answers: string[]): string[] {
		let possible = [...words];

		for (let i = 0; i < guesses.length; i++) {
			const guess = guesses[i];
			const answer = answers[i];

			possible = possible.filter((word) => {
				// Check if this word would produce the same answer for this guess
				const testAnswer = this.computeAnswer(guess, word);
				return testAnswer === answer;
			});
		}

		return possible;
	}

	/**
	 * Compute answer pattern for a guess against a target word
	 */
	private computeAnswer(guess: string, targetWord: string): string {
		const available = Array.from(targetWord);
		const answer = Array(this.wordLength).fill('_');

		// First, find exact matches
		for (let i = 0; i < this.wordLength; i += 1) {
			if (guess[i] === available[i]) {
				answer[i] = 'x';
				available[i] = ' ';
			}
		}

		// Then find close matches
		for (let i = 0; i < this.wordLength; i += 1) {
			if (answer[i] === '_') {
				const index = available.indexOf(guess[i]);
				if (index !== -1) {
					answer[i] = 'c';
					available[index] = ' ';
				}
			}
		}

		return answer.join('');
	}

	/**
	 * Choose the answer pattern that maximizes remaining possibilities.
	 *
	 * This is the core of the "impossible" game mechanics:
	 * 1. For each word in the current possibility set, compute what pattern would be shown
	 *    if that word were the answer (e.g., "xxc__" means exact, exact, close, wrong, wrong)
	 * 2. Group all possible words by their pattern - words that produce the same pattern are grouped together
	 * 3. Select the pattern group with the MOST words - this keeps the maximum number of possibilities alive
	 * 4. Update the possibility set to only include words from the chosen pattern group
	 * 5. Return the chosen pattern to display to the player
	 *
	 * Example: If player guesses "house" and we have 100 possible words:
	 * - 30 words would produce pattern "x____" (h correct, rest wrong)
	 * - 50 words would produce pattern "_x___" (o correct, rest wrong)
	 * - 20 words would produce pattern "xxxxx" (perfect match)
	 * We choose pattern "_x___" because it keeps 50 possibilities alive (the most),
	 * making it harder for the player to narrow down the answer.
	 *
	 * @param guess The player's guess
	 * @returns The answer pattern that maximizes remaining word possibilities
	 */
	private chooseAdversarialAnswer(guess: string): string {
		// Group possible words by the answer pattern they would produce
		// Key: pattern string (e.g., "xxc__"), Value: array of words that produce this pattern
		const patternGroups = new Map<string, string[]>();

		for (const word of this.possibleWords) {
			const pattern = this.computeAnswer(guess, word);
			if (!patternGroups.has(pattern)) {
				patternGroups.set(pattern, []);
			}
			patternGroups.get(pattern)!.push(word);
		}

		// Find the pattern with the most words (maximizes remaining possibilities = maximizes difficulty)
		// Collect all patterns that tie for the maximum count to ensure uniform random selection
		let maxCount = 0;
		const tiedPatterns: Array<{ pattern: string; words: string[] }> = [];

		for (const [pattern, words] of patternGroups) {
			if (words.length > maxCount) {
				// Found a new maximum - clear previous ties and start fresh
				maxCount = words.length;
				tiedPatterns.length = 0;
				tiedPatterns.push({ pattern, words });
			} else if (words.length === maxCount) {
				// This pattern ties with the current maximum - add it to the collection
				tiedPatterns.push({ pattern, words });
			}
		}

		// Randomly select from tied patterns with uniform distribution
		// This ensures fair randomization when multiple patterns have the same count
		const selected = tiedPatterns[Math.floor(Math.random() * tiedPatterns.length)];

		// Update possible words to only those matching the chosen pattern
		// This ensures future guesses are evaluated against a consistent set
		this.possibleWords = selected.words;

		return selected.pattern;
	}

	/**
	 * Get the current answer word (one of the remaining possibilities)
	 */
	getCurrentAnswer(): string {
		if (this.possibleWords.length === 0) {
			// This should never happen - it indicates a bug in the adversarial algorithm
			// where all possible words have been eliminated, which breaks the game's consistency
			const errorMsg =
				`Critical error: No possible words remaining after ${this.guesses.length} guesses. ` +
				`Last guess: "${this.guesses[this.guesses.length - 1]}", ` +
				`Last answer: "${this.answers[this.answers.length - 1]}". ` +
				`This indicates a bug in chooseAdversarialAnswer or filterPossibleWords.`;
			console.error(errorMsg);
			throw new Error(errorMsg);
		}
		// Return a random word from remaining possibilities
		return this.possibleWords[Math.floor(Math.random() * this.possibleWords.length)];
	}

	/**
	 * Check if the game is won
	 */
	isWon(): boolean {
		return this.answers.at(-1) === 'x'.repeat(this.wordLength);
	}

	/**
	 * Get elapsed time in milliseconds
	 */
	getElapsedTime(): number {
		if (this.endTime) {
			return this.endTime - this.startTime;
		}
		return Date.now() - this.startTime;
	}

	/**
	 * Update game state based on a guess. Returns true if valid.
	 */
	enter(letters: string[]): boolean {
		const word = letters.join('');
		const allowed = new Set(this.wordList);
		const valid = allowed.has(word);

		if (!valid) return false;

		// Choose the adversarial answer pattern
		const answer = this.chooseAdversarialAnswer(word);

		this.guesses.push(word);
		this.answers.push(answer);

		// If game is won, record end time
		if (answer === 'x'.repeat(this.wordLength)) {
			this.endTime = Date.now();
		}

		return true;
	}

	/**
	 * Serialize game state so it can be set as a cookie
	 */
	toString(): string {
		const endTimePart = this.endTime ? `-${this.endTime}` : '';
		return `${this.startTime}-${this.guesses.join(' ')}-${this.answers.join(' ')}${endTimePart}`;
	}
}
