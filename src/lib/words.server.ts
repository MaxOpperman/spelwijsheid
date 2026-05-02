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
	/** Whether to exclude Roman numerals from the results */
	excludeRomanNumeral?: boolean;
	/** Locale string used to select the appropriate dictionary (e.g. 'nl-NL', 'en-US', 'en-GB') */
	locale?: string;
}

/**
 * Map each supported locale to its dictionary filename in the static directory.
 * Unrecognised locales fall back to the English (US) wordlist.
 */
const WORDLIST_FILE_BY_LOCALE: Record<string, string> = {
	'en-US': 'wordlist-en-us.txt',
	'en-GB': 'wordlist-en-gb.txt',
	'nl-NL': 'wordlist-nl-nl.txt'
};

/**
 * Resolve the wordlist filename for the given locale.
 * Falls back to English (US) when no locale is specified or the locale is unrecognised.
 */
function getWordlistFile(locale?: string): string {
	if (locale && locale in WORDLIST_FILE_BY_LOCALE) {
		return WORDLIST_FILE_BY_LOCALE[locale];
	}
	if (locale) {
		console.warn(`Unrecognized locale "${locale}", defaulting to English US wordlist.`);
	}
	return WORDLIST_FILE_BY_LOCALE['en-US'];
}

/**
 * Return true when the locale uses English (and therefore has no ij digraph).
 * When no locale is provided, the default wordlist is English (en-US), so also returns true.
 */
function isEnglishLocale(locale?: string): boolean {
	if (!locale) return true; // default wordlist is en-US
	return locale.startsWith('en');
}

/**
 * Normalize accented characters to their base ASCII equivalents.
 * For example: ü → u, é → e, ñ → n, etc.
 */
export function normalizeAccentedCharacters(text: string): string {
	return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const wordCache: Map<string, string[]> = new Map();

/**
 * Load the raw word list for the given locale.
 * Uses a per-file cache (keyed by filename) so each file is read at most once.
 */
function loadRawWords(locale?: string): string[] {
	const fileName = getWordlistFile(locale);
	if (!wordCache.has(fileName)) {
		const filePath = path.resolve(`static/${fileName}`);
		const fileContent = readFileSync(filePath, 'utf-8');
		wordCache.set(
			fileName,
			Array.from(
				new Set(
					fileContent
						.split('\n')
						.map((line) => line.trim())
						.filter((word) => word.length > 0)
				)
			)
		);
	}
	return wordCache.get(fileName)!;
}

/**
 * Check if a word is a Roman numeral and returns true if it is.
 * Returns false for the empty string.
 */
export function isRomanNumeral(word: string): boolean {
	// Match valid Roman numerals (I, II, III, IV, V, etc.)
	// This regex matches Roman numerals from 1 to 3999
	const romanNumeralPattern = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/i;
	return romanNumeralPattern.test(word) && word.length > 0;
}

/**
 * Get filtered words based on the provided configuration.
 * The language (and therefore which dictionary file is used) is determined by the
 * `locale` field in the config.  Dutch-specific processing (ij digraph handling)
 * is skipped for English locales.
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
		excludeRomanNumeral = true,
		locale
	} = config;

	// English has no ij digraph: always treat i and j as individual characters.
	const effectiveSplitIj = isEnglishLocale(locale) ? true : splitIjDigraph;

	const rawWords = loadRawWords(locale);

	return rawWords
		.filter((word) => {
			// Filter out Roman numerals
			if (excludeRomanNumeral && isRomanNumeral(word)) return false;

			// Normalize accents first if enabled (for accurate length calculation and filtering)
			const normalizedWord = normalizeAccents ? normalizeAccentedCharacters(word) : word;

			// For digraph mode (effectiveSplitIj = false), convert 'ij' to 'ĳ' for length calculation
			// For split mode (effectiveSplitIj = true), keep 'ij' as two characters
			const processedWord = effectiveSplitIj
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
			if (effectiveSplitIj) {
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
		excludeRomanNumeral: config.excludeRomanNumeral ?? false
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
		excludeRomanNumeral: config.excludeRomanNumeral ?? true
	});
}
