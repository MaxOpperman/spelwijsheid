/**
 * Generate a list of filtered words based on the input characters and mode.
 * @param inputChars - The characters to filter words by.
 * @param lowercaseModeParam - Whether to ignore case when filtering.
 * @returns An array of filtered words.
 */
export default function generateFilteredWords(
	wordList: string[],
	inputChars: string[],
	lowercaseModeParam: boolean
): string[] {
	if (inputChars.includes('ij')) {
		// replace 'ij' with a placeholder to treat it as a single character
		inputChars = inputChars.map((char) => (char === 'ij' ? 'ĳ' : char));
	}

	// Convert input characters to lowercase set
	const availableCharsSet = new Set(inputChars.map((char) => char.toLowerCase()));

	// Check if both 'i' and 'j' are available separately (can also match 'ĳ' digraph)
	const canFormDigraph = availableCharsSet.has('i') && availableCharsSet.has('j');
	if (canFormDigraph) {
		availableCharsSet.add('ĳ');
	}

	// Filter words that contain only a subset of the available characters
	// The first character (mandatory) must always be present in the word
	const filteredWords = wordList.filter((word) => {
		// Convert word to lowercase for comparison (if lowercase mode is enabled)
		const normalizedWord = lowercaseModeParam ? word.toLowerCase() : word;

		// Check if mandatory first character is present in the word
		const mandatoryChar = inputChars[0].toLowerCase();
		if (!normalizedWord.includes(mandatoryChar)) {
			return false; // Mandatory character must be present
		}

		// Get unique characters from the word (treating 'ij' as single unit)
		const wordCharsSet = new Set<string>();
		let i = 0;
		while (i < normalizedWord.length) {
			if (i < normalizedWord.length - 1 && normalizedWord.substring(i, i + 2) === 'ij') {
				wordCharsSet.add('ĳ');
				i += 2;
			} else {
				wordCharsSet.add(normalizedWord[i]);
				i += 1;
			}
		}

		// Check if all unique characters in the word are available in input
		for (const wordChar of wordCharsSet) {
			if (!availableCharsSet.has(wordChar)) {
				return false; // Word contains a character not in input
			}
		}

		return true;
	});

	// Remove duplicates by converting to Set and back to array
	const uniqueWords = Array.from(new Set(filteredWords));

	// Sort results by length (shorter words first)
	return uniqueWords.sort((a, b) => a.length - b.length);
}

// Dutch letters separated by type for better randomization
const dutchVowels = ['a', 'e', 'i', 'o', 'u', 'ĳ']; // ĳ is a vowel sound in Dutch
const dutchConsonants = [
	'n',
	'r',
	't',
	's',
	'l',
	'd',
	'g',
	'h',
	'k',
	'm',
	'b',
	'p',
	'v',
	'w',
	'z',
	'c',
	'f',
	'j'
];

export function generateRandomChars(wordList: string[]): string[] {
	let attempts = 0;
	const maxAttempts = 25; // Prevent infinite loops

	while (attempts < maxAttempts) {
		attempts++;

		// Generate initial set of 6-8 letters
		const numLetters = Math.floor(Math.random() * 3) + 6; // 6-8 letters
		let selectedLetters: string[] = [];

		// Ensure we have 2-3 vowels for good word formation
		const numVowels = Math.floor(Math.random() * 2) + 2; // 2-3 vowels
		const numConsonants = numLetters - numVowels;

		// Select vowels
		const shuffledVowels = [...dutchVowels].sort(() => 0.5 - Math.random());
		selectedLetters.push(...shuffledVowels.slice(0, numVowels));

		// Select consonants (avoid having both 'i' and 'j' in the same set to prevent confusion)
		const shuffledConsonants = [...dutchConsonants].sort(() => 0.5 - Math.random());
		let selectedConsonants = shuffledConsonants.slice(0, numConsonants);

		// Check if both 'i' and 'j' are selected (from vowels and consonants)
		const hasI = selectedLetters.includes('i') || selectedConsonants.includes('i');
		const hasJ = selectedConsonants.includes('j');

		if (hasI && hasJ) {
			// Remove 'j' and get next available consonant
			selectedConsonants = selectedConsonants.filter((c) => c !== 'j');
			const remainingConsonants = shuffledConsonants.filter(
				(c) => !selectedConsonants.includes(c) && c !== 'j'
			);
			if (remainingConsonants.length > 0) {
				selectedConsonants.push(remainingConsonants[0]);
			}
		}

		selectedLetters.push(...selectedConsonants);

		// Shuffle the selection
		selectedLetters = selectedLetters.sort(() => 0.5 - Math.random());

		// Check if this combination yields 30-60 possible words
		const possibleWords = generateFilteredWords(wordList, selectedLetters, false);

		// If we're in the target range, return this set
		if (possibleWords.length >= 25 && possibleWords.length <= 65) {
			return selectedLetters;
		}

		// If too few words, try adding more letters (up to 10 total)
		if (possibleWords.length < 30 && selectedLetters.length < 10) {
			const allLetters = [...dutchVowels, ...dutchConsonants];
			const unusedLetters = allLetters.filter((letter) => !selectedLetters.includes(letter));

			// Check if we already have 'i' or 'j' to avoid adding the other
			const hasI = selectedLetters.includes('i');
			const hasJ = selectedLetters.includes('j');

			// Filter out 'i' or 'j' if the other is already present
			const safeUnusedLetters = unusedLetters.filter((letter) => {
				if (hasI && letter === 'j') return false;
				if (hasJ && letter === 'i') return false;
				return true;
			});

			// Try adding 1-2 more letters
			const extraLetters = Math.min(2, 10 - selectedLetters.length, safeUnusedLetters.length);
			const shuffledUnused = safeUnusedLetters.sort(() => 0.5 - Math.random());
			const expandedSet = [...selectedLetters, ...shuffledUnused.slice(0, extraLetters)];

			try {
				const expandedWords = generateFilteredWords(wordList, expandedSet, false);
				if (expandedWords.length >= 30 && expandedWords.length <= 60) {
					return expandedSet;
				}
			} catch (error) {
				console.log('Error generating words with letters', expandedSet, ':', error);
			}
		}
	}

	// Fallback: return a basic set if we can't find a good combination
	console.warn('Could not generate optimal letter set, using fallback');
	return ['a', 'e', 'n', 'r', 't', 's'];
}
