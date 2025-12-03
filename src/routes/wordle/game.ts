export class Game {
	index: number;
	guesses: string[];
	answers: string[];
	answer: string;
	wordList: string[];
	allowed: Set<string>;
	wordLength: number;

	/**
	 * Create a game object from the player's cookie, or initialise a new game
	 */
	constructor(serialized: string | undefined, wordList: string[], wordLength: number = 5) {
		this.wordList = wordList;
		this.allowed = new Set(wordList);
		this.wordLength = wordLength;

		if (serialized) {
			const [index, guesses, answers] = serialized.split('-');

			this.index = +index;
			this.guesses = guesses ? guesses.split(' ') : [];
			this.answers = answers ? answers.split(' ') : [];
		} else {
			this.index = Math.floor(Math.random() * wordList.length);
			this.guesses = Array(6).fill('');
			this.answers = [];
		}

		this.answer = wordList[this.index];
	}

	/**
	 * Update game state based on a guess of a word. Returns
	 * true if the guess was valid, false otherwise
	 */
	enter(letters: string[]) {
		const word = letters.join('');
		const valid = this.allowed.has(word);

		if (!valid) return false;

		this.guesses[this.answers.length] = word;

		const available = Array.from(this.answer);
		const answer = Array(this.wordLength).fill('_');

		// first, find exact matches
		for (let i = 0; i < this.wordLength; i += 1) {
			if (letters[i] === available[i]) {
				answer[i] = 'x';
				available[i] = ' ';
			}
		}

		// then find close matches (this has to happen
		// in a second step, otherwise an early close
		// match can prevent a later exact match)
		for (let i = 0; i < this.wordLength; i += 1) {
			if (answer[i] === '_') {
				const index = available.indexOf(letters[i]);
				if (index !== -1) {
					answer[i] = 'c';
					available[index] = ' ';
				}
			}
		}

		this.answers.push(answer.join(''));

		return true;
	}

	/**
	 * Serialize game state so it can be set as a cookie
	 */
	toString() {
		return `${this.index}-${this.guesses.join(' ')}-${this.answers.join(' ')}`;
	}
}
