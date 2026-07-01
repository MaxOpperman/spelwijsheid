import { describe, it, expect } from 'vitest';
import { Buffer } from 'buffer';
import { extractMmdbFromTar } from '../scripts/download-geoip.js';

/** Build a single POSIX tar entry (512-byte header + padded data). */
function tarEntry(name: string, content: Buffer): Buffer {
	const header = Buffer.alloc(512);
	header.write(name, 0, 'utf-8');
	// Size as a NUL-terminated 11-digit octal field at offset 124.
	header.write(content.length.toString(8).padStart(11, '0') + '\0', 124, 'utf-8');
	const padded = Buffer.alloc(Math.ceil(content.length / 512) * 512);
	content.copy(padded);
	return Buffer.concat([header, padded]);
}

/** A pair of zero blocks marks the end of a tar archive. */
const TAR_END = Buffer.alloc(1024);

describe('extractMmdbFromTar', () => {
	it('returns the contents of the .mmdb entry', () => {
		const mmdb = Buffer.from('FAKE-MMDB-CONTENT');
		const tar = Buffer.concat([
			tarEntry('GeoLite2-City_20260101/GeoLite2-City.mmdb', mmdb),
			TAR_END
		]);
		const result = extractMmdbFromTar(tar);
		expect(result).not.toBeNull();
		expect(result!.toString('utf-8')).toBe('FAKE-MMDB-CONTENT');
	});

	it('skips non-mmdb entries and finds the database', () => {
		const readme = Buffer.from('this is the copyright readme, not the database');
		const mmdb = Buffer.from('THE-REAL-DATABASE-BYTES');
		const tar = Buffer.concat([
			tarEntry('GeoLite2-City_20260101/COPYRIGHT.txt', readme),
			tarEntry('GeoLite2-City_20260101/GeoLite2-City.mmdb', mmdb),
			TAR_END
		]);
		expect(extractMmdbFromTar(tar)?.toString('utf-8')).toBe('THE-REAL-DATABASE-BYTES');
	});

	it('preserves the exact byte length of the database entry', () => {
		const mmdb = Buffer.from([0x00, 0x01, 0x02, 0xff, 0xfe, 0x42]);
		const tar = Buffer.concat([tarEntry('db/GeoLite2-City.mmdb', mmdb), TAR_END]);
		const result = extractMmdbFromTar(tar);
		expect(result).not.toBeNull();
		expect(result!.length).toBe(mmdb.length);
		expect(Buffer.compare(result!, mmdb)).toBe(0);
	});

	it('returns null when no .mmdb entry is present', () => {
		const tar = Buffer.concat([tarEntry('dir/README.txt', Buffer.from('nope')), TAR_END]);
		expect(extractMmdbFromTar(tar)).toBeNull();
	});

	it('returns null for an empty archive', () => {
		expect(extractMmdbFromTar(TAR_END)).toBeNull();
	});
});
