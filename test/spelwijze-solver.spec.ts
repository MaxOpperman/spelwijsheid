import { describe, it, expect } from 'vitest';
import generateFilteredWords from '../src/lib/solver';
import {
	getSolverWords,
	getWordleWords,
	normalizeAccentedCharacters
} from '../src/lib/words.server';

// Load the Dutch word list for testing
const allWords = getSolverWords();

describe('generateFilteredWords', () => {
	it('example from how-to-play (b a n d) returns expected words', () => {
		const inputs = ['b', 'a', 'n', 'd'];
		const results = generateFilteredWords(allWords, inputs, false);

		// Check if common expected words are present
		expect(results).toContain('band');
		expect(results).toContain('baan');
		expect(results).toContain('bandana');
		expect(results).toContain('banaan');

		// Check that words without mandatory 'b' are not included
		const wordsWithoutB = results.filter((word) => !word.includes('b'));
		expect(wordsWithoutB).toHaveLength(0);

		// All results should only use letters from b,a,n,d
		results.forEach((word) => {
			// Check that word only contains available characters
			const wordUnits = new Set(word.toLowerCase().split(''));
			wordUnits.forEach((char) => {
				expect(['b', 'a', 'n', 'd']).toContain(char);
			});
		});
		expect(results.length).toEqual(new Set(results).size);
	});

	it('when ij is provided it matches words containing ij correctly', () => {
		const inputs = ['z', 'ij', 'e', 'r'];
		const results = generateFilteredWords(allWords, inputs, false);

		// All results should contain 'z' since it's mandatory (first char)
		results.forEach((word) => {
			expect(word.toLowerCase()).toContain('z');
		});

		// Should only contain words that use ij, z, e, r
		expect(results).toContain('rĳĳzer');
		expect(results).toContain('zeer');
		expect(results).toContain('zere');
		expect(results).toContain('ĳzer');
		expect(results.length).toBe(4);
	});

	it('when ij is provided at the start', () => {
		const inputs = ['ij', 'd', 'e', 'l', 'm', 'a', 'n'];
		const results = generateFilteredWords(allWords, inputs, false);

		// All results should contain 'ij' since it's mandatory (first char)
		results.forEach((word) => {
			expect(word.toLowerCase()).toContain('ĳ');
		});

		// Should only contain words that use ij, d, e, l, m, a, n
		expect(results).toContain('ĳdel');
		expect(results).toContain('dĳen');
		expect(results).toContain('ĳlen');
		expect(results).toContain('mĳne');
		expect(results).toContain('lĳden');
		expect(results).toContain('lĳmen');
		expect(results).toContain('lĳnen');
		expect(results).toContain('meelĳ');
		expect(results).toContain('mĳden');
		expect(results).toContain('mĳnen');
		expect(results).toContain('aanlĳn');
		expect(results).toContain('damlĳn');
		expect(results).toContain('deellĳn');
		expect(results).toContain('lĳnmeel');
		expect(results).toContain('medelĳden');
		expect(results).toContain('medelĳdend');
		// OpenTaal has more words than the original dictionary
		expect(results.length).toBeGreaterThanOrEqual(16);
	});

	it('should handle case i and j split correctly', () => {
		const inputs = ['a', 'b', 'd', 'i', 'j'];

		const results = generateFilteredWords(allWords, inputs, false);

		// Should contain words that use a, b, d, i, j
		// When separate 'i' and 'j' are provided, they can form 'ij' digraph in words
		expect(results).toContain('abdĳ'); // Word contains 'ij' as digraph character
		expect(results).toContain('baba');
		expect(results).toContain('daad');
	});
});

describe('normalizeAccentedCharacters', () => {
	it('should convert accented characters to their base form', () => {
		expect(normalizeAccentedCharacters('reünie')).toBe('reunie');
		expect(normalizeAccentedCharacters('café')).toBe('cafe');
		expect(normalizeAccentedCharacters('naïef')).toBe('naief');
		expect(normalizeAccentedCharacters('Ångström')).toBe('Angstrom');
		expect(normalizeAccentedCharacters('résumé')).toBe('resume');
	});

	it('should leave non-accented characters unchanged', () => {
		expect(normalizeAccentedCharacters('hello')).toBe('hello');
		expect(normalizeAccentedCharacters('WORLD')).toBe('WORLD');
		expect(normalizeAccentedCharacters('test123')).toBe('test123');
	});

	it('should handle empty strings', () => {
		expect(normalizeAccentedCharacters('')).toBe('');
	});
});

describe('getSolverWords with accent normalization', () => {
	it('should include normalized accented words by default', () => {
		const words = getSolverWords();
		// "reünie" should be normalized to "reunie" in the list
		expect(words).toContain('reunie');
	});

	it('should allow finding words with accents using non-accented input', () => {
		const inputs = ['r', 'e', 'u', 'n', 'i'];
		const results = generateFilteredWords(allWords, inputs, false);
		// Should contain "reunie" (normalized from "reünie")
		expect(results).toContain('reunie');
	});

	it('should not contain words with accents when normalization is enabled', () => {
		const words = getSolverWords();
		// Words should not contain accented characters like ü, é, ë, etc.
		const hasAccentedWords = words.some((word) => /[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýÿ]/i.test(word));
		expect(hasAccentedWords).toBe(false);
	});

	it('should preserve accented characters when normalizeAccents is false', () => {
		const words = getSolverWords({ normalizeAccents: false });
		// Check if the list contains at least some accented words
		const hasAccentedWords = words.some((word) => /[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýÿ]/i.test(word));
		expect(hasAccentedWords).toBe(true);
		// "reünie" should still have the accent
		expect(words).toContain('reünie');
	});

	it('should return different word counts based on accent normalization', () => {
		const input = ['c', 'r', 'e', 'n'];
		const normalizedWords = generateFilteredWords(getSolverWords(), input, false);
		const accentedWords = generateFilteredWords(
			getSolverWords({ normalizeAccents: false }),
			input,
			false
		);
		expect(normalizedWords).toContain('creeer');
		expect(normalizedWords).toContain('creeren');
		expect(normalizedWords).toContain('recreeren');
		expect(normalizedWords.length).toEqual(3);
		expect(accentedWords.length).toEqual(0);
	});
});

describe('getWordleWords with accent normalization', () => {
	it('should normalize accented words by default', () => {
		// Get 6-letter Wordle words (reunie is 6 letters)
		const words = getWordleWords({ exactLength: 6 });
		// "reünie" should be normalized to "reunie"
		expect(words).toContain('reunie');
		expect(words).not.toContain('reünie');
	});

	it('should preserve accented characters when normalizeAccents is false', () => {
		// Get 6-letter Wordle words without accent normalization
		// Need to also disable alphabeticOnly since accented chars would be filtered out
		const words = getWordleWords({
			exactLength: 6,
			normalizeAccents: false,
			alphabeticOnly: false
		});
		// "reünie" should keep the accent
		expect(words).toContain('reünie');
		expect(words).not.toContain('reunie');
	});
});
