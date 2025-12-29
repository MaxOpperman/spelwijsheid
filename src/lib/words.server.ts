import { readFileSync } from 'fs';
import path from 'path';

/**
 * Configuration for word filtering
 */
export interface WordFilterConfig {
	/** Minimum character count (treating 'ij' as single character) */
	minLength?: number;
	/** Exact character count (treating 'ij' as single character) */
	exactLength?: number;
	/** Maximum character count (treating 'ij' as single character) */
	maxLength?: number;
	/** Whether to convert words to lowercase */
	lowercase?: boolean;
	/** Whether to filter only alphabetic characters */
	alphabeticOnly?: boolean;
	/** Whether to split 'ij' digraph into two characters */
	splitIjDigraph?: boolean;
	/** Whether to normalize accented characters to their base form (e.g., ü → u). Defaults to true. */
	normalizeAccents?: boolean;
	/** Whether the word is a Roman numeral */
	romanNumeral?: boolean;
}

/**
 * Normalize accented characters to their base ASCII equivalents.
 * For example: ü → u, é → e, ñ → n, etc.
 */
export function normalizeAccentedCharacters(text: string): string {
	return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

let cachedWords: string[] | null = null;

/**
 * Load the raw word list from the dictionary-nl package
 */
function loadRawWords(): string[] {
	if (cachedWords === null) {
		// Path to the OpenTaal wordlist in the static directory
		const filePath = path.resolve('static/wordlist.txt');
		const fileContent = readFileSync(filePath, 'utf-8');
		cachedWords = Array.from(
			new Set(
				fileContent
					.split('\n')
					.map((line) => line.trim())
					.filter((word) => word.length > 0)
			)
		);
	}
	return cachedWords;
}

/**
 * Check if a word is a Roman numeral
 */
function isRomanNumeral(word: string): boolean {
	// Match valid Roman numerals (I, II, III, IV, V, etc.)
	// This regex matches Roman numerals from 1 to 3999
	const romanNumeralPattern = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/i;
	return romanNumeralPattern.test(word);
}

/**
 * Get filtered Dutch words based on the provided configuration
 */
export function getFilteredWords(config: WordFilterConfig = {}): string[] {
	const {
		minLength,
		exactLength,
		maxLength,
		lowercase = false,
		alphabeticOnly = false,
		splitIjDigraph = false,
		normalizeAccents = true,
		romanNumeral = false
	} = config;

	const rawWords = loadRawWords();

	return rawWords
		.filter((word) => {
			// Filter out Roman numerals
			if (romanNumeral && isRomanNumeral(word)) return false;

			// Normalize accents first if enabled (for accurate length calculation and filtering)
			const normalizedWord = normalizeAccents ? normalizeAccentedCharacters(word) : word;

			// For digraph mode (splitIjDigraph = false), convert 'ij' to 'ĳ' for length calculation
			// For split mode (splitIjDigraph = true), keep 'ij' as two characters
			const processedWord = splitIjDigraph
				? normalizedWord
				: normalizedWord.replace(/ij/g, 'ĳ').replace(/IJ/g, 'Ĳ').replace(/Ij/g, 'Ĳ');

			const effectiveLength = processedWord.length;

			// Apply length filters based on effective length
			if (minLength !== undefined && effectiveLength < minLength) return false;
			if (exactLength !== undefined && effectiveLength !== exactLength) return false;
			if (maxLength !== undefined && effectiveLength > maxLength) return false;

			// Apply alphabetic filter (check normalized word)
			if (alphabeticOnly && !/^[a-zA-Z]+$/.test(normalizedWord)) return false;

			return true;
		})
		.map((word) => {
			// Normalize accents first if enabled
			let processedWord = normalizeAccents ? normalizeAccentedCharacters(word) : word;

			// Convert based on mode
			if (splitIjDigraph) {
				// Split mode: keep ij as two characters (original format from OpenTaal)
				return lowercase ? processedWord.toLowerCase() : processedWord;
			} else {
				// Digraph mode: convert ij to ĳ single character
				processedWord = processedWord.replace(/ij/g, 'ĳ').replace(/IJ/g, 'Ĳ').replace(/Ij/g, 'Ĳ');
				return lowercase ? processedWord.toLowerCase() : processedWord;
			}
		});
}

/**
 * Get words for the solver (4+ characters)
 */
export function getSolverWords(config: WordFilterConfig = {}): string[] {
	return getFilteredWords({
		...config,
		minLength: config.minLength ?? 4,
		normalizeAccents: config.normalizeAccents ?? true,
		romanNumeral: config.romanNumeral ?? false
	});
}

/**
 * Get words for Wordle (exactly 5 characters, lowercase, alphabetic only)
 */
export function getWordleWords(config: WordFilterConfig = {}): string[] {
	return getFilteredWords({
		...config,
		exactLength: config.exactLength ?? 5,
		lowercase: config.lowercase ?? true,
		alphabeticOnly: config.alphabeticOnly ?? true,
		splitIjDigraph: config.splitIjDigraph ?? false,
		normalizeAccents: config.normalizeAccents ?? true,
		romanNumeral: config.romanNumeral ?? false
	});
}
