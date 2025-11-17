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
}

let cachedWords: string[] | null = null;

/**
 * Load the raw word list from the dictionary-nl package
 */
function loadRawWords(): string[] {
	if (cachedWords === null) {
		const filePath = path.resolve('node_modules/dictionary-nl/index.dic');
		const fileContent = readFileSync(filePath, 'utf-8');
		cachedWords = fileContent
			.split('\n')
			.map(line => line.split('/')[0].trim()) // Extract words before any metadata
			.filter(word => word.length > 0); // Remove empty lines
	}
	return cachedWords;
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
	} = config;

	const rawWords = loadRawWords();
	
	return rawWords
		.filter(word => {
			// Calculate the effective length considering ij digraph splitting
			let effectiveLength = word.length;
			if (splitIjDigraph) {
				// Count how many 'ij' occurrences will add an extra character
				const ijCount = (word.match(/ij/g) || []).length;
				const ijUpperCount = (word.match(/ĳ/g) || []).length;
				const IJUpperCount = (word.match(/Ĳ/g) || []).length;
				effectiveLength += ijCount + ijUpperCount + IJUpperCount;
			}
			
			// Apply length filters based on effective length
			if (minLength !== undefined && effectiveLength < minLength) return false;
			if (exactLength !== undefined && effectiveLength !== exactLength) return false;
			if (maxLength !== undefined && effectiveLength > maxLength) return false;
			
			// Apply alphabetic filter
			if (alphabeticOnly && !/^[a-zA-ZĳĲ]+$/.test(word)) return false;

			return true;
		})
		.map(word => {
			// Map 'ij' digraph into two characters if splitIjDigraph is true
			if (splitIjDigraph) {
				word = word.replace(/ij/g, 'i' + 'j').replace(/ĳ/g, 'i' + 'j').replace(/Ĳ/g, 'I' + 'J');
			}
			return lowercase ? word.toLowerCase() : word;
		});
}

/**
 * Get words for the solver (4+ characters)
 */
export function getSolverWords(): string[] {
	return getFilteredWords({ minLength: 4 });
}

/**
 * Get words for Wordle (exactly 5 characters, lowercase, alphabetic only)
 */
export function getWordleWords(config: WordFilterConfig = {}): string[] {
	return getFilteredWords({ 
		minLength: config.minLength,
		exactLength: config.exactLength ?? 5,
		maxLength: config.maxLength,
		lowercase: config.lowercase ?? true,
		alphabeticOnly: config.alphabeticOnly ?? true,
		splitIjDigraph: config.splitIjDigraph ?? false,
	});
}
