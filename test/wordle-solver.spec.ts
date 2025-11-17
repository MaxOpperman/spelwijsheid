import { describe, it, expect } from 'vitest';
import { getWordleWords } from '../src/lib/words.server';

describe('Wordle Solver - ij digraph handling', () => {
	describe('Known test words', () => {
		it('should handle abdij correctly - 4 chars with digraph, 5 when split', () => {
			// With digraph: a-b-d-ij = 4 characters
			const wordsWithDigraph = getWordleWords({ exactLength: 4, splitIjDigraph: false });
			expect(wordsWithDigraph).toContain('abdĳ');
			
			// With split: a-b-d-i-j = 5 characters
			const wordsWithSplit = getWordleWords({ exactLength: 5, splitIjDigraph: true });
			expect(wordsWithSplit).toContain('abdij');
		});

		it('should handle blijf correctly - 4 chars with digraph, 5 when split', () => {
			// With digraph: b-l-ij-f = 4 characters
			const wordsWithDigraph = getWordleWords({ exactLength: 4, splitIjDigraph: false });
			expect(wordsWithDigraph).toContain('blĳf');
			
			// With split: b-l-i-j-f = 5 characters
			const wordsWithSplit = getWordleWords({ exactLength: 5, splitIjDigraph: true });
			expect(wordsWithSplit).toContain('blijf');
		});

		it('should handle gelijk correctly - 5 chars with digraph, 6 when split', () => {
			// With digraph: g-e-l-ij-k = 5 characters
			const wordsWithDigraph = getWordleWords({ exactLength: 5, splitIjDigraph: false });
			expect(wordsWithDigraph).toContain('gelĳk');
			
			// With split: g-e-l-i-j-k = 6 characters
			const wordsWithSplit = getWordleWords({ exactLength: 6, splitIjDigraph: true });
			expect(wordsWithSplit).toContain('gelijk');
		});
	});

	describe('With digraph enabled (default)', () => {
		it('should return 5-character words treating ij as single character', () => {
			const words = getWordleWords({ exactLength: 5, splitIjDigraph: false });
			
			// gelijk should be included (5 chars with ij as digraph)
			expect(words).toContain('gelĳk');
			
			// abdij and blijf should NOT be included (they are 4 chars with digraph)
			expect(words).not.toContain('abdĳ');
			expect(words).not.toContain('blĳf');
		});

		it('should return 4-character words with ij digraph', () => {
			const words = getWordleWords({ exactLength: 4, splitIjDigraph: false });
			
			// These should be included (4 chars with ij as digraph)
			expect(words).toContain('abdĳ');
			expect(words).toContain('blĳf');
		});
	});

	describe('With digraph disabled (splitIjDigraph: true)', () => {
		it('should return 5-character words treating ij as two separate characters', () => {
			const words = getWordleWords({ exactLength: 5, splitIjDigraph: true });
			
			// abdij and blijf should be included (5 chars when ij is split)
			expect(words).toContain('abdij');
			expect(words).toContain('blijf');
			
			// gelijk should NOT be included (it's 6 chars when split)
			expect(words).not.toContain('gelĳk');
			expect(words).not.toContain('gelijk');
		});

		it('should return 6-character words when ij is split', () => {
			const words = getWordleWords({ exactLength: 6, splitIjDigraph: true });
			
			// gelijk should be included (6 chars when ij is split)
			expect(words).toContain('gelijk');
			expect(words).not.toContain('gelĳk');
		});
	});

	describe('Word list verification', () => {
		it('should have different word counts for split vs non-split at length 5', () => {
			const wordsWithDigraph = getWordleWords({ exactLength: 5, splitIjDigraph: false });
			const wordsWithSplit = getWordleWords({ exactLength: 5, splitIjDigraph: true });
			
			// The counts should be different because different words qualify
			expect(wordsWithDigraph.length).not.toBe(wordsWithSplit.length);
		});

		it('should maintain word integrity when splitting', () => {
			const words = getWordleWords({ exactLength: 5, splitIjDigraph: true });
			
			// Words should still contain 'ij' as consecutive letters in output
			const abdij = words.find((w: string) => w === 'abdij');
			expect(abdij).toBeDefined();
			expect(abdij).toContain('ij');
		});
	});
});