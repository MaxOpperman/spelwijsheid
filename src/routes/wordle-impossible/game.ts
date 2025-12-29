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
	 * Choose the answer pattern that maximizes remaining possibilities
	 */
	private chooseAdversarialAnswer(guess: string): string {
		// Group possible words by the answer pattern they would produce
		const patternGroups = new Map<string, string[]>();

		for (const word of this.possibleWords) {
			const pattern = this.computeAnswer(guess, word);
			if (!patternGroups.has(pattern)) {
				patternGroups.set(pattern, []);
			}
			patternGroups.get(pattern)!.push(word);
		}

		// Find the pattern with the most words (maximizes difficulty)
		let maxCount = 0;
		let bestPattern = '';
		let bestWords: string[] = [];

		for (const [pattern, words] of patternGroups) {
			if (words.length > maxCount) {
				maxCount = words.length;
				bestPattern = pattern;
				bestWords = words;
			} else if (words.length === maxCount && Math.random() < 0.5) {
				// Add some randomization when counts are equal
				bestPattern = pattern;
				bestWords = words;
			}
		}

		// Update possible words to only those matching the chosen pattern
		this.possibleWords = bestWords;

		return bestPattern;
	}

	/**
	 * Get the current answer word (one of the remaining possibilities)
	 */
	getCurrentAnswer(): string {
		if (this.possibleWords.length === 0) {
			// Shouldn't happen, but fall back to a random word
			return this.wordList[Math.floor(Math.random() * this.wordList.length)];
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
