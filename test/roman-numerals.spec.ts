import { describe, it, expect } from 'vitest';
import { isRomanNumeral } from '../src/lib/words.server';

describe('isRomanNumeral', () => {
	describe('Single digit Roman numerals (1-10)', () => {
		it('should recognize I (1)', () => {
			expect(isRomanNumeral('I')).toBe(true);
			expect(isRomanNumeral('i')).toBe(true);
		});

		it('should recognize II (2)', () => {
			expect(isRomanNumeral('II')).toBe(true);
			expect(isRomanNumeral('ii')).toBe(true);
		});

		it('should recognize III (3)', () => {
			expect(isRomanNumeral('III')).toBe(true);
			expect(isRomanNumeral('iii')).toBe(true);
		});

		it('should recognize IV (4)', () => {
			expect(isRomanNumeral('IV')).toBe(true);
			expect(isRomanNumeral('iv')).toBe(true);
		});

		it('should recognize V (5)', () => {
			expect(isRomanNumeral('V')).toBe(true);
			expect(isRomanNumeral('v')).toBe(true);
		});

		it('should recognize VI (6)', () => {
			expect(isRomanNumeral('VI')).toBe(true);
			expect(isRomanNumeral('vi')).toBe(true);
		});

		it('should recognize VII (7)', () => {
			expect(isRomanNumeral('VII')).toBe(true);
			expect(isRomanNumeral('vii')).toBe(true);
		});

		it('should recognize VIII (8)', () => {
			expect(isRomanNumeral('VIII')).toBe(true);
			expect(isRomanNumeral('viii')).toBe(true);
		});

		it('should recognize IX (9)', () => {
			expect(isRomanNumeral('IX')).toBe(true);
			expect(isRomanNumeral('ix')).toBe(true);
		});

		it('should recognize X (10)', () => {
			expect(isRomanNumeral('X')).toBe(true);
			expect(isRomanNumeral('x')).toBe(true);
		});
	});

	describe('Tens and hundreds', () => {
		it('should recognize XI (11)', () => {
			expect(isRomanNumeral('XI')).toBe(true);
			expect(isRomanNumeral('xi')).toBe(true);
		});

		it('should recognize XX (20)', () => {
			expect(isRomanNumeral('XX')).toBe(true);
			expect(isRomanNumeral('xx')).toBe(true);
		});

		it('should recognize XXX (30)', () => {
			expect(isRomanNumeral('XXX')).toBe(true);
			expect(isRomanNumeral('xxx')).toBe(true);
		});

		it('should recognize XL (40)', () => {
			expect(isRomanNumeral('XL')).toBe(true);
			expect(isRomanNumeral('xl')).toBe(true);
		});

		it('should recognize L (50)', () => {
			expect(isRomanNumeral('L')).toBe(true);
			expect(isRomanNumeral('l')).toBe(true);
		});

		it('should recognize LX (60)', () => {
			expect(isRomanNumeral('LX')).toBe(true);
			expect(isRomanNumeral('lx')).toBe(true);
		});

		it('should recognize XC (90)', () => {
			expect(isRomanNumeral('XC')).toBe(true);
			expect(isRomanNumeral('xc')).toBe(true);
		});

		it('should recognize C (100)', () => {
			expect(isRomanNumeral('C')).toBe(true);
			expect(isRomanNumeral('c')).toBe(true);
		});

		it('should recognize CC (200)', () => {
			expect(isRomanNumeral('CC')).toBe(true);
			expect(isRomanNumeral('cc')).toBe(true);
		});

		it('should recognize CCC (300)', () => {
			expect(isRomanNumeral('CCC')).toBe(true);
			expect(isRomanNumeral('ccc')).toBe(true);
		});

		it('should recognize CD (400)', () => {
			expect(isRomanNumeral('CD')).toBe(true);
			expect(isRomanNumeral('cd')).toBe(true);
		});

		it('should recognize D (500)', () => {
			expect(isRomanNumeral('D')).toBe(true);
			expect(isRomanNumeral('d')).toBe(true);
		});

		it('should recognize DC (600)', () => {
			expect(isRomanNumeral('DC')).toBe(true);
			expect(isRomanNumeral('dc')).toBe(true);
		});

		it('should recognize DCC (700)', () => {
			expect(isRomanNumeral('DCC')).toBe(true);
			expect(isRomanNumeral('dcc')).toBe(true);
		});

		it('should recognize DCCC (800)', () => {
			expect(isRomanNumeral('DCCC')).toBe(true);
			expect(isRomanNumeral('dccc')).toBe(true);
		});

		it('should recognize CM (900)', () => {
			expect(isRomanNumeral('CM')).toBe(true);
			expect(isRomanNumeral('cm')).toBe(true);
		});
	});

	describe('Thousands', () => {
		it('should recognize M (1000)', () => {
			expect(isRomanNumeral('M')).toBe(true);
			expect(isRomanNumeral('m')).toBe(true);
		});

		it('should recognize MM (2000)', () => {
			expect(isRomanNumeral('MM')).toBe(true);
			expect(isRomanNumeral('mm')).toBe(true);
		});

		it('should recognize MMCCC (2300)', () => {
			expect(isRomanNumeral('MMCCC')).toBe(true);
			expect(isRomanNumeral('mmccc')).toBe(true);
		});

		it('should recognize MMM (3000)', () => {
			expect(isRomanNumeral('MMM')).toBe(true);
			expect(isRomanNumeral('mmm')).toBe(true);
		});
	});

	describe('Complex Roman numerals', () => {
		it('should recognize XLII (42)', () => {
			expect(isRomanNumeral('XLII')).toBe(true);
			expect(isRomanNumeral('xlii')).toBe(true);
		});

		it('should recognize XCIX (99)', () => {
			expect(isRomanNumeral('XCIX')).toBe(true);
			expect(isRomanNumeral('xcix')).toBe(true);
		});

		it('should recognize CDXLIV (444)', () => {
			expect(isRomanNumeral('CDXLIV')).toBe(true);
			expect(isRomanNumeral('cdxliv')).toBe(true);
		});

		it('should recognize MCMXCIV (1994)', () => {
			expect(isRomanNumeral('MCMXCIV')).toBe(true);
			expect(isRomanNumeral('mcmxciv')).toBe(true);
		});

		it('should recognize MCMXCIX (1999)', () => {
			expect(isRomanNumeral('MCMXCIX')).toBe(true);
			expect(isRomanNumeral('mcmxcix')).toBe(true);
		});

		it('should recognize MMXXIII (2023)', () => {
			expect(isRomanNumeral('MMXXIII')).toBe(true);
			expect(isRomanNumeral('mmxxiii')).toBe(true);
		});

		it('should recognize MMMCMXCIX (3999)', () => {
			expect(isRomanNumeral('MMMCMXCIX')).toBe(true);
			expect(isRomanNumeral('mmmcmxcix')).toBe(true);
		});
	});

	describe('Mixed case', () => {
		it('should recognize mixed case Roman numerals', () => {
			expect(isRomanNumeral('Iv')).toBe(true);
			expect(isRomanNumeral('Vi')).toBe(true);
			expect(isRomanNumeral('Ix')).toBe(true);
			expect(isRomanNumeral('Xi')).toBe(true);
			expect(isRomanNumeral('xX')).toBe(true);
		});
	});

	describe('Invalid Roman numerals', () => {
		it('should reject empty string', () => {
			expect(isRomanNumeral('')).toBe(false);
		});

		it('should reject invalid characters', () => {
			expect(isRomanNumeral('A')).toBe(false);
			expect(isRomanNumeral('Z')).toBe(false);
			expect(isRomanNumeral('123')).toBe(false);
			expect(isRomanNumeral('IVX')).toBe(false);
		});

		it('should reject invalid repetitions', () => {
			expect(isRomanNumeral('IIII')).toBe(false); // Should be IV
			expect(isRomanNumeral('VV')).toBe(false); // V cannot repeat
			expect(isRomanNumeral('LL')).toBe(false); // L cannot repeat
			expect(isRomanNumeral('DD')).toBe(false); // D cannot repeat
			expect(isRomanNumeral('XXXX')).toBe(false); // Should be XL
			expect(isRomanNumeral('CCCC')).toBe(false); // Should be CD
		});

		it('should reject invalid subtractive combinations', () => {
			expect(isRomanNumeral('IL')).toBe(false); // Invalid, should be XLIX
			expect(isRomanNumeral('IC')).toBe(false); // Invalid, should be XCIX
			expect(isRomanNumeral('XD')).toBe(false); // Invalid
			expect(isRomanNumeral('XM')).toBe(false); // Invalid
		});

		it('should reject numbers greater than 3999', () => {
			expect(isRomanNumeral('MMMM')).toBe(false); // 4000 is beyond the pattern
		});

		it('should reject common words that contain Roman numeral letters', () => {
			expect(isRomanNumeral('MIXEN')).toBe(false);
			expect(isRomanNumeral('VICE')).toBe(false);
			expect(isRomanNumeral('CIVIL')).toBe(false);
			expect(isRomanNumeral('MILD')).toBe(false);
		});

		it('should reject words with spaces or special characters', () => {
			expect(isRomanNumeral('I V')).toBe(false);
			expect(isRomanNumeral('X-V')).toBe(false);
			expect(isRomanNumeral('V.')).toBe(false);
		});
	});

	describe('Edge cases', () => {
		it('should handle zero-like patterns', () => {
			// There is no zero in Roman numerals, but empty patterns should be rejected
			expect(isRomanNumeral('N')).toBe(false); // Sometimes N is used for zero, but not standard
		});

		it('should recognize the smallest valid numeral', () => {
			expect(isRomanNumeral('I')).toBe(true);
		});

		it('should recognize the largest valid numeral', () => {
			expect(isRomanNumeral('MMMCMXCIX')).toBe(true); // 3999
		});
	});
});
