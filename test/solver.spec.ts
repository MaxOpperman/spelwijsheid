import { describe, it, expect } from 'vitest';
import generateFilteredWords from '../src/lib/solver';
import { getSolverWords } from '../src/lib/words.server';

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
		const wordsWithoutB = results.filter(word => !word.includes('b'));
		expect(wordsWithoutB).toHaveLength(0);
		
		// All results should only use letters from b,a,n,d
		results.forEach(word => {
			// Check that word only contains available characters
			const wordUnits = new Set(word.toLowerCase().split(''));
			wordUnits.forEach(char => {
				expect(['b', 'a', 'n', 'd']).toContain(char);
			});
		});
		expect(results.length).toEqual(new Set(results).size);
	});

	it('when ij is provided it matches words containing ij correctly', () => {
		const inputs = ['z', 'ij', 'e', 'r'];
		const results = generateFilteredWords(allWords, inputs, false);
		
		// All results should contain 'z' since it's mandatory (first char)
		results.forEach(word => {
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
		results.forEach(word => {
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
		expect(results.length).toBe(16);
	});
});
