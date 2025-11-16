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
		alphabeticOnly = false
	} = config;

	const rawWords = loadRawWords();
	
	return rawWords
		.filter(word => {
            // Remove words where 'ij' are together
            if (word.includes('ij')) return false;
			
			// Apply length filters
			if (minLength !== undefined && word.length < minLength) return false;
			if (exactLength !== undefined && word.length !== exactLength) return false;
			if (maxLength !== undefined && word.length > maxLength) return false;
			
			// Apply alphabetic filter
			if (alphabeticOnly && !/^[a-zA-Z]+$/.test(word)) return false;
			
			return true;
		})
		.map(word => lowercase ? word.toLowerCase() : word);
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
export function getWordleWords(): string[] {
	return getFilteredWords({ 
		exactLength: 5, 
		lowercase: true, 
		alphabeticOnly: true 
	});
}
