import { describe, it, expect } from 'vitest';
import { getWordleWords } from '../src/lib/words.server';

describe('Wordle Solver - ij digraph handling', () => {
	describe('Known test words', () => {
		it('should handle abdij correctly - 4 chars with digraph, 5 when split', () => {
			// With digraph: a-b-d-ij = 4 characters
			const wordsWithDigraph = getWordleWords({
				exactLength: 4,
				splitIjDigraph: false,
				locale: 'nl-NL'
			});
			expect(wordsWithDigraph).toContain('abdĳ');

			// With split: a-b-d-i-j = 5 characters
			const wordsWithSplit = getWordleWords({
				exactLength: 5,
				splitIjDigraph: true,
				locale: 'nl-NL'
			});
			expect(wordsWithSplit).toContain('abdij');
		});

		it('should handle blijf correctly - 4 chars with digraph, 5 when split', () => {
			// With digraph: b-l-ij-f = 4 characters
			const wordsWithDigraph = getWordleWords({
				exactLength: 4,
				splitIjDigraph: false,
				locale: 'nl-NL'
			});
			expect(wordsWithDigraph).toContain('blĳf');

			// With split: b-l-i-j-f = 5 characters
			const wordsWithSplit = getWordleWords({
				exactLength: 5,
				splitIjDigraph: true,
				locale: 'nl-NL'
			});
			expect(wordsWithSplit).toContain('blijf');
		});

		it('should handle gelijk correctly - 5 chars with digraph, 6 when split', () => {
			// With digraph: g-e-l-ij-k = 5 characters
			const wordsWithDigraph = getWordleWords({
				exactLength: 5,
				splitIjDigraph: false,
				locale: 'nl-NL'
			});
			expect(wordsWithDigraph).toContain('gelĳk');

			// With split: g-e-l-i-j-k = 6 characters
			const wordsWithSplit = getWordleWords({
				exactLength: 6,
				splitIjDigraph: true,
				locale: 'nl-NL'
			});
			expect(wordsWithSplit).toContain('gelijk');
		});
	});

	describe('With digraph enabled (default)', () => {
		it('should return 4-character words with ij digraph', () => {
			const words = getWordleWords({ exactLength: 4, splitIjDigraph: false, locale: 'nl-NL' });

			// These should be included (4 chars with ij as digraph)
			expect(words).toContain('abdĳ');
			expect(words).toContain('blĳf');
			expect(words.length).toBeGreaterThan(0);
		});

		it('should return 5-character words treating ij as single character', () => {
			const words = getWordleWords({ exactLength: 5, splitIjDigraph: false, locale: 'nl-NL' });

			// gelijk should be included (5 chars with ij as digraph)
			expect(words).toContain('gelĳk');

			// abdij and blijf should NOT be included (they are 4 chars with digraph)
			expect(words).not.toContain('abdĳ');
			expect(words).not.toContain('blĳf');
		});

		it('should return 6-character words with ij digraph', () => {
			const words = getWordleWords({ exactLength: 6, splitIjDigraph: false, locale: 'nl-NL' });

			expect(words.length).toBeGreaterThan(0);
			// All words should have exactly 6 characters when counting ĳ as 1
			words.slice(0, 10).forEach((word: string) => {
				expect(word.length).toBe(6);
			});
		});

		it('should return 7-character words with ij digraph', () => {
			const words = getWordleWords({ exactLength: 7, splitIjDigraph: false, locale: 'nl-NL' });

			expect(words.length).toBeGreaterThan(0);
			// All words should have exactly 7 characters when counting ĳ as 1
			words.slice(0, 10).forEach((word: string) => {
				expect(word.length).toBe(7);
			});
		});
	});

	describe('With digraph disabled (splitIjDigraph: true)', () => {
		it('should return 4-character words when ij is split', () => {
			const words = getWordleWords({ exactLength: 4, splitIjDigraph: true, locale: 'nl-NL' });

			expect(words.length).toBeGreaterThan(0);
			// All words should have exactly 4 characters
			words.slice(0, 10).forEach((word: string) => {
				expect(word.length).toBe(4);
			});
			// Should not contain digraph versions of ij words
			expect(words.some((w: string) => w.includes('ĳ'))).toBe(false);
		});

		it('should return 5-character words treating ij as two separate characters', () => {
			const words = getWordleWords({ exactLength: 5, splitIjDigraph: true, locale: 'nl-NL' });

			// abdij and blijf should be included (5 chars when ij is split)
			expect(words).toContain('abdij');
			expect(words).toContain('blijf');

			// gelijk should NOT be included (it's 6 chars when split)
			expect(words).not.toContain('gelĳk');
			expect(words).not.toContain('gelijk');
		});

		it('should return 6-character words when ij is split', () => {
			const words = getWordleWords({ exactLength: 6, splitIjDigraph: true, locale: 'nl-NL' });

			// gelijk should be included (6 chars when ij is split)
			expect(words).toContain('gelijk');
			expect(words).not.toContain('gelĳk');
		});

		it('should return 7-character words when ij is split', () => {
			const words = getWordleWords({ exactLength: 7, splitIjDigraph: true, locale: 'nl-NL' });

			expect(words.length).toBeGreaterThan(0);
			// All words should have exactly 7 characters
			words.slice(0, 10).forEach((word: string) => {
				expect(word.length).toBe(7);
			});
		});
	});

	describe('Word list verification', () => {
		it('should have different word counts for split vs non-split at all lengths', () => {
			[4, 5, 6, 7].forEach((length) => {
				const wordsWithDigraph = getWordleWords({
					exactLength: length,
					splitIjDigraph: false,
					locale: 'nl-NL'
				});
				const wordsWithSplit = getWordleWords({
					exactLength: length,
					splitIjDigraph: true,
					locale: 'nl-NL'
				});

				// Both should return words
				expect(wordsWithDigraph.length).toBeGreaterThan(0);
				expect(wordsWithSplit.length).toBeGreaterThan(0);

				// The counts should be different because different words qualify
				expect(wordsWithDigraph.length).not.toBe(wordsWithSplit.length);
			});
		});

		it('should maintain word integrity when splitting', () => {
			const words = getWordleWords({ exactLength: 5, splitIjDigraph: true, locale: 'nl-NL' });

			// Words should still contain 'ij' as consecutive letters in output
			const abdij = words.find((w: string) => w === 'abdij');
			expect(abdij).toBeDefined();
			expect(abdij).toContain('ij');
		});

		it('should return valid word lists for all supported lengths', () => {
			[4, 5, 6, 7].forEach((length) => {
				const words = getWordleWords({
					exactLength: length,
					splitIjDigraph: false,
					locale: 'nl-NL'
				});
				expect(words).toBeInstanceOf(Array);
				expect(words.length).toBeGreaterThan(0);
				// Verify all words have correct length
				words.slice(0, 5).forEach((word: string) => {
					expect(word.length).toBe(length);
				});
			});
		});
	});
});
