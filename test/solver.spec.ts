import { describe, it, expect } from 'vitest';
import generateFilteredWords from '../src/lib/solver';
import { readFileSync } from 'fs';
import path from 'path';

// Load a subset of the Dutch word list for testing (including shorter words for test purposes)
const filePath = path.resolve('node_modules/dictionary-nl/index.dic');
const fileContent = readFileSync(filePath, 'utf-8');
const allWords = fileContent
	.split('\n')
	.map(line => line.split('/')[0].trim())
	.filter(word => {
		if (word.length === 0) return false;
		const charCount = word.replace(/ij/g, 'x').length;
		return charCount >= 4 && charCount <= 8; // Include 4+ char words for testing
	});

describe('generateFilteredWords', () => {
	it('example from how-to-play (b a n d) returns expected words', () => {
		const inputs = ['b', 'a', 'n', 'd'];
		const results = generateFilteredWords(allWords, inputs, false);
		
		console.log('Results for [b,a,n,d]:', results);
		
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
	});

	it('when ij is provided it matches words containing ij correctly', () => {
		const inputs = ['z', 'ij', 'e', 'r'];
		const results = generateFilteredWords(allWords, inputs, false);
		
		console.log('Results for [ij,z,e,r]:', results.slice(0, 10));
		
		// All results should contain 'z' since it's mandatory (first char)
		results.forEach(word => {
			expect(word.toLowerCase()).toContain('z');
		});
		
		// Should only contain words that use ij, z, e, r
		expect(results.length).toBeGreaterThan(0);

        expect(results).toContain('ijzer');
	});
});
