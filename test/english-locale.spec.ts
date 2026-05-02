import { describe, it, expect } from 'vitest';
import { getSolverWords, getWordleWords } from '../src/lib/words.server';

describe('English locale word loading', () => {
	describe('getWordleWords with English locale', () => {
		it('should return 5-letter English words for en-US', () => {
			const words = getWordleWords({ exactLength: 5, locale: 'en-US' });
			expect(words.length).toBeGreaterThan(0);
			// Common 5-letter English words present in both locales
			expect(words).toContain('apple');
			expect(words).toContain('hello');
			expect(words).toContain('world');
		});

		it('should return 5-letter English words for en-GB', () => {
			const words = getWordleWords({ exactLength: 5, locale: 'en-GB' });
			expect(words.length).toBeGreaterThan(0);
			expect(words).toContain('apple');
			expect(words).toContain('hello');
		});

		it('should return English words of each supported length', () => {
			for (const len of [4, 5, 6, 7]) {
				const words = getWordleWords({ exactLength: len, locale: 'en-US' });
				expect(words.length).toBeGreaterThan(0);
				words.slice(0, 5).forEach((word) => {
					expect(word.length).toBe(len);
				});
			}
		});

		it('should not contain Dutch-specific ij digraph characters for English locale', () => {
			const words = getWordleWords({ exactLength: 5, locale: 'en-US' });
			expect(words.some((w) => w.includes('ĳ'))).toBe(false);
		});

		it('should return lowercase alphabetic words only by default', () => {
			const words = getWordleWords({ exactLength: 5, locale: 'en-US' });
			words.slice(0, 20).forEach((word) => {
				expect(word).toMatch(/^[a-z]+$/);
			});
		});
	});

	describe('en-US and en-GB have distinct dictionaries', () => {
		it('en-US contains American spellings that are absent from en-GB', () => {
			const usWords = getWordleWords({ exactLength: 5, locale: 'en-US' });
			const gbWords = getWordleWords({ exactLength: 5, locale: 'en-GB' });
			// "color" is the US spelling; en-GB should use "colour"
			expect(usWords).toContain('color');
			expect(gbWords).not.toContain('color');
		});

		it('en-GB contains British spellings that are absent from en-US', () => {
			const usWords = getWordleWords({ exactLength: 6, locale: 'en-US' });
			const gbWords = getWordleWords({ exactLength: 6, locale: 'en-GB' });
			// "colour" is the GB spelling; en-US should use "color"
			expect(gbWords).toContain('colour');
			expect(usWords).not.toContain('colour');
		});

		it('en-US and en-GB 5-letter word lists are not identical', () => {
			const usWords = getWordleWords({ exactLength: 5, locale: 'en-US' });
			const gbWords = getWordleWords({ exactLength: 5, locale: 'en-GB' });
			// The two lists should differ in content
			expect(usWords).not.toEqual(gbWords);
		});
	});

	describe('getSolverWords with English locale', () => {
		it('should return English words of 4+ characters for en-US', () => {
			const words = getSolverWords({ locale: 'en-US' });
			expect(words.length).toBeGreaterThan(0);
			words.slice(0, 5).forEach((word) => {
				expect(word.length).toBeGreaterThanOrEqual(4);
			});
		});

		it('should return English words for en-GB', () => {
			const words = getSolverWords({ locale: 'en-GB' });
			expect(words.length).toBeGreaterThan(0);
		});
	});

	describe('Dutch locale still works correctly', () => {
		it('should return Dutch words with ij digraph for nl-NL', () => {
			const words = getWordleWords({ exactLength: 5, locale: 'nl-NL' });
			expect(words.length).toBeGreaterThan(0);
			// Dutch-specific words
			expect(words).toContain('gelĳk');
		});

		it('should return different words for Dutch vs English locale', () => {
			const nlWords = new Set(getWordleWords({ exactLength: 5, locale: 'nl-NL' }));
			const enWords = new Set(getWordleWords({ exactLength: 5, locale: 'en-US' }));
			// The two word lists should be different (Dutch vs English)
			expect(nlWords).not.toEqual(enWords);
		});
	});

	describe('Default locale behaviour', () => {
		it('should use English (US) words when no locale is specified', () => {
			const defaultWords = getWordleWords({ exactLength: 5 });
			const enUSWords = getWordleWords({ exactLength: 5, locale: 'en-US' });
			expect(defaultWords).toEqual(enUSWords);
		});

		it('should not return Dutch words when no locale is specified', () => {
			const defaultWords = new Set(getWordleWords({ exactLength: 5 }));
			const nlWords = new Set(getWordleWords({ exactLength: 5, locale: 'nl-NL' }));
			expect(defaultWords).not.toEqual(nlWords);
		});
	});

	describe('English locale ij digraph handling', () => {
		it('should treat ij as two separate characters in English (no digraph conversion)', () => {
			// "bijou" contains 'ij' - it should be counted as 5 chars (b-i-j-o-u), not 4
			const fiveLetterWords = getWordleWords({ exactLength: 5, locale: 'en-US' });
			expect(fiveLetterWords).toContain('bijou');
		});

		it('should produce the same result with or without splitIjDigraph for English locale', () => {
			const withDigraph = getWordleWords({
				exactLength: 5,
				splitIjDigraph: false,
				locale: 'en-US'
			});
			const withSplit = getWordleWords({ exactLength: 5, splitIjDigraph: true, locale: 'en-US' });
			// For English, both options should produce identical results
			expect(withDigraph).toEqual(withSplit);
		});
	});
});
