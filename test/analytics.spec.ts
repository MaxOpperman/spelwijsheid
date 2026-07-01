import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FingerprintSignals } from '../src/lib/server/analytics';

// analytics.ts imports `$env/dynamic/private`, which is a SvelteKit virtual
// module that does not resolve under plain vitest. Stub it before importing.
vi.mock('$env/dynamic/private', () => ({ env: {} }));
// Prevent maxmind from touching the real filesystem during the top-level import.
vi.mock('maxmind', () => ({ default: { open: vi.fn() } }));

const { parseUserAgent, getClientIp, parseClientHints, computeFingerprint } =
	await import('../src/lib/server/analytics');

describe('parseUserAgent', () => {
	it('returns all nulls for a missing user agent', () => {
		expect(parseUserAgent(null)).toEqual({
			browser: null,
			browserVersion: null,
			os: null,
			osVersion: null,
			deviceType: null,
			deviceVendor: null,
			deviceModel: null
		});
	});

	it('parses Chrome on Windows', () => {
		const ua =
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
		const info = parseUserAgent(ua);
		expect(info.browser).toBe('Chrome');
		expect(info.os).toBe('Windows');
		expect(info.browserVersion).toMatch(/^124\./);
	});

	it('parses Firefox on macOS', () => {
		const ua =
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0';
		const info = parseUserAgent(ua);
		expect(info.browser).toBe('Firefox');
		expect(info.os).toBe('macOS');
	});

	it('parses Safari on iOS', () => {
		const ua =
			'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
		const info = parseUserAgent(ua);
		expect(info.os).toBe('iOS');
		expect(info.browser).toContain('Safari');
	});
});

describe('getClientIp', () => {
	it('uses the first entry of x-forwarded-for', () => {
		const headers = new Headers({ 'x-forwarded-for': '203.0.113.7, 70.41.3.18, 150.172.238.178' });
		expect(getClientIp(headers, () => '10.0.0.1')).toBe('203.0.113.7');
	});

	it('trims whitespace around the forwarded IP', () => {
		const headers = new Headers({ 'x-forwarded-for': '  198.51.100.5  ' });
		expect(getClientIp(headers, () => '10.0.0.1')).toBe('198.51.100.5');
	});

	it('falls back to x-real-ip when no forwarded header is present', () => {
		const headers = new Headers({ 'x-real-ip': '198.51.100.23' });
		expect(getClientIp(headers, () => '10.0.0.1')).toBe('198.51.100.23');
	});

	it('falls back to getClientAddress when no proxy headers are present', () => {
		const headers = new Headers();
		expect(getClientIp(headers, () => '192.0.2.44')).toBe('192.0.2.44');
	});

	it('returns null when getClientAddress throws', () => {
		const headers = new Headers();
		expect(
			getClientIp(headers, () => {
				throw new Error('no address');
			})
		).toBeNull();
	});
});

// lookupGeo has a module-level singleton (geoLoadAttempted / geoReader). Each
// test must start with a fresh module instance to avoid state leaking between
// tests. We achieve this with vi.resetModules() + vi.doMock() in beforeEach,
// then import the module freshly inside each test.
describe('lookupGeo', () => {
	let mockOpen: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.resetModules();
		mockOpen = vi.fn();
		// Provide a non-empty DB path so getGeoReader() actually calls open().
		vi.doMock('$env/dynamic/private', () => ({
			env: { GEOIP_DB_PATH: '/fake/GeoLite2-City.mmdb' }
		}));
		vi.doMock('maxmind', () => ({ default: { open: mockOpen } }));
	});

	async function freshLookupGeo() {
		const mod = await import('../src/lib/server/analytics');
		return mod.lookupGeo;
	}

	it('returns all nulls when ip is null (reader never opened)', async () => {
		const lookupGeo = await freshLookupGeo();
		expect(await lookupGeo(null)).toEqual({
			continent: null,
			continentCode: null,
			euMember: null,
			country: null,
			registeredCountry: null,
			region: null,
			regionCode: null,
			subregion: null,
			city: null,
			postalCode: null,
			latitude: null,
			longitude: null,
			accuracyRadius: null,
			geoTimezone: null
		});
		expect(mockOpen).not.toHaveBeenCalled();
	});

	it('returns all nulls when maxmind.open throws (DB unavailable)', async () => {
		mockOpen.mockRejectedValueOnce(new Error('file not found'));
		const lookupGeo = await freshLookupGeo();
		expect(await lookupGeo('1.2.3.4')).toEqual({
			continent: null,
			continentCode: null,
			euMember: null,
			country: null,
			registeredCountry: null,
			region: null,
			regionCode: null,
			subregion: null,
			city: null,
			postalCode: null,
			latitude: null,
			longitude: null,
			accuracyRadius: null,
			geoTimezone: null
		});
	});

	it('maps country, region, city, latitude and longitude from a reader result', async () => {
		const mockReader = {
			get: vi.fn().mockReturnValue({
				country: { names: { en: 'Netherlands' } },
				subdivisions: [{ names: { en: 'North Holland' } }],
				city: { names: { en: 'Amsterdam' } },
				location: { latitude: 52.3676, longitude: 4.9041 }
			})
		};
		mockOpen.mockResolvedValueOnce(mockReader);
		const lookupGeo = await freshLookupGeo();
		expect(await lookupGeo('94.214.0.1')).toMatchObject({
			country: 'Netherlands',
			region: 'North Holland',
			city: 'Amsterdam',
			latitude: 52.3676,
			longitude: 4.9041
		});
	});

	it('returns all nulls when reader.get returns null (private/unroutable IP)', async () => {
		const mockReader = { get: vi.fn().mockReturnValue(null) };
		mockOpen.mockResolvedValueOnce(mockReader);
		const lookupGeo = await freshLookupGeo();
		expect(await lookupGeo('127.0.0.1')).toEqual({
			continent: null,
			continentCode: null,
			euMember: null,
			country: null,
			registeredCountry: null,
			region: null,
			regionCode: null,
			subregion: null,
			city: null,
			postalCode: null,
			latitude: null,
			longitude: null,
			accuracyRadius: null,
			geoTimezone: null
		});
	});

	it('maps all extended geo fields from a full reader result', async () => {
		const mockReader = {
			get: vi.fn().mockReturnValue({
				continent: { names: { en: 'Europe' }, code: 'EU' },
				country: { names: { en: 'Netherlands' }, is_in_european_union: true },
				registered_country: { names: { en: 'Netherlands' } },
				subdivisions: [
					{ names: { en: 'North Holland' }, iso_code: 'NH' },
					{ names: { en: 'Amsterdam Area' } }
				],
				city: { names: { en: 'Amsterdam' } },
				postal: { code: '1011' },
				location: {
					latitude: 52.3676,
					longitude: 4.9041,
					accuracy_radius: 20,
					time_zone: 'Europe/Amsterdam'
				}
			})
		};
		mockOpen.mockResolvedValueOnce(mockReader);
		const lookupGeo = await freshLookupGeo();
		expect(await lookupGeo('94.214.0.1')).toEqual({
			continent: 'Europe',
			continentCode: 'EU',
			euMember: true,
			country: 'Netherlands',
			registeredCountry: 'Netherlands',
			region: 'North Holland',
			regionCode: 'NH',
			subregion: 'Amsterdam Area',
			city: 'Amsterdam',
			postalCode: '1011',
			latitude: 52.3676,
			longitude: 4.9041,
			accuracyRadius: 20,
			geoTimezone: 'Europe/Amsterdam'
		});
	});

	it('returns null subregion when there is only one subdivision', async () => {
		const mockReader = {
			get: vi.fn().mockReturnValue({
				subdivisions: [{ names: { en: 'North Holland' }, iso_code: 'NH' }]
			})
		};
		mockOpen.mockResolvedValueOnce(mockReader);
		const lookupGeo = await freshLookupGeo();
		const result = await lookupGeo('94.214.0.1');
		expect(result.region).toBe('North Holland');
		expect(result.subregion).toBeNull();
	});
});

describe('lookupIsp', () => {
	let mockOpen: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.resetModules();
		mockOpen = vi.fn();
		vi.doMock('$env/dynamic/private', () => ({
			env: { GEOIP_ASN_DB_PATH: '/fake/GeoLite2-ASN.mmdb' }
		}));
		vi.doMock('maxmind', () => ({ default: { open: mockOpen } }));
	});

	async function freshLookupIsp() {
		const mod = await import('../src/lib/server/analytics');
		return mod.lookupIsp;
	}

	it('returns { isp: null, asn: null } when ip is null (reader never opened)', async () => {
		const lookupIsp = await freshLookupIsp();
		expect(await lookupIsp(null)).toEqual({ isp: null, asn: null });
		expect(mockOpen).not.toHaveBeenCalled();
	});

	it('returns nulls when maxmind.open throws (DB unavailable)', async () => {
		mockOpen.mockRejectedValueOnce(new Error('file not found'));
		const lookupIsp = await freshLookupIsp();
		expect(await lookupIsp('1.2.3.4')).toEqual({ isp: null, asn: null });
	});

	it('returns nulls when reader.get returns null (private/unroutable IP)', async () => {
		const mockReader = { get: vi.fn().mockReturnValue(null) };
		mockOpen.mockResolvedValueOnce(mockReader);
		const lookupIsp = await freshLookupIsp();
		expect(await lookupIsp('127.0.0.1')).toEqual({ isp: null, asn: null });
	});

	it('returns isp name and asn number from reader result', async () => {
		const mockReader = {
			get: vi.fn().mockReturnValue({
				autonomous_system_organization: 'SURF B.V.',
				autonomous_system_number: 1103
			})
		};
		mockOpen.mockResolvedValueOnce(mockReader);
		const lookupIsp = await freshLookupIsp();
		expect(await lookupIsp('145.0.0.1')).toEqual({ isp: 'SURF B.V.', asn: 1103 });
	});

	it('returns { isp: null, asn: null } when no DB path is configured', async () => {
		vi.resetModules();
		vi.doMock('$env/dynamic/private', () => ({ env: {} })); // no ASN path
		vi.doMock('maxmind', () => ({ default: { open: mockOpen } }));
		const mod = await import('../src/lib/server/analytics');
		expect(await mod.lookupIsp('1.2.3.4')).toEqual({ isp: null, asn: null });
		expect(mockOpen).not.toHaveBeenCalled();
	});
});

describe('parseClientHints', () => {
	it('returns all nulls when no hint headers are present', () => {
		expect(parseClientHints(new Headers())).toEqual({
			cpuArch: null,
			osPlatformVersion: null,
			browserFullVersion: null
		});
	});

	it('reads sec-ch-ua-arch', () => {
		const headers = new Headers({ 'sec-ch-ua-arch': 'x86' });
		expect(parseClientHints(headers).cpuArch).toBe('x86');
	});

	it('reads sec-ch-ua-platform-version', () => {
		const headers = new Headers({ 'sec-ch-ua-platform-version': '15.0.0' });
		expect(parseClientHints(headers).osPlatformVersion).toBe('15.0.0');
	});

	it('reads sec-ch-ua-full-version-list', () => {
		const value = '"Chromium";v="124.0.6367.82","Google Chrome";v="124.0.6367.82"';
		const headers = new Headers({ 'sec-ch-ua-full-version-list': value });
		expect(parseClientHints(headers).browserFullVersion).toBe(value);
	});
});

describe('computeFingerprint', () => {
	const BASE: FingerprintSignals = {
		os: 'Windows',
		osVersion: '10',
		browser: 'Chrome',
		browserVersion: '124.0.6367.82',
		deviceType: null,
		deviceVendor: null,
		deviceModel: null,
		cpuArch: 'x86',
		cpuCores: 8,
		deviceMemory: 16,
		screenW: 1920,
		screenH: 1080,
		dpr: 1,
		colorDepth: 24,
		pointerCoarse: false,
		hoverNone: false,
		timezone: 'Europe/Amsterdam',
		languageHeader: 'nl-NL,nl;q=0.9,en;q=0.8',
		colorScheme: 'dark'
	};

	it('returns a 64-character hex string for a well-populated signal set', () => {
		expect(computeFingerprint(BASE)).toMatch(/^[0-9a-f]{64}$/);
	});

	it('returns the same hash for identical signals', () => {
		expect(computeFingerprint(BASE)).toBe(computeFingerprint({ ...BASE }));
	});

	it('returns null when fewer than 3 signals are non-empty', () => {
		const sparse: FingerprintSignals = {
			os: 'Windows',
			osVersion: null,
			browser: null,
			browserVersion: null,
			deviceType: null,
			deviceVendor: null,
			deviceModel: null,
			cpuArch: null,
			cpuCores: null,
			deviceMemory: null,
			screenW: null,
			screenH: null,
			dpr: null,
			colorDepth: null,
			pointerCoarse: null,
			hoverNone: null,
			timezone: null,
			languageHeader: null,
			colorScheme: null
		};
		expect(computeFingerprint(sparse)).toBeNull();
	});

	it('produces a different hash when any signal changes', () => {
		const original = computeFingerprint(BASE);
		expect(computeFingerprint({ ...BASE, os: 'macOS' })).not.toBe(original);
		expect(computeFingerprint({ ...BASE, screenW: 1440 })).not.toBe(original);
		expect(computeFingerprint({ ...BASE, colorScheme: 'light' })).not.toBe(original);
	});

	it('treats same major browser version as identical (ignores minor)', () => {
		const v1 = computeFingerprint({ ...BASE, browserVersion: '124.0.0.1' });
		const v2 = computeFingerprint({ ...BASE, browserVersion: '124.9.9.9' });
		expect(v1).toBe(v2);
	});

	it('uses only the primary language tag from languageHeader', () => {
		const h1 = computeFingerprint({ ...BASE, languageHeader: 'nl-NL,nl;q=0.9,en;q=0.8' });
		const h2 = computeFingerprint({ ...BASE, languageHeader: 'nl-NL' });
		expect(h1).toBe(h2);
	});

	it('treats different primary languages as different fingerprints', () => {
		const nlHash = computeFingerprint({ ...BASE, languageHeader: 'nl-NL' });
		const enHash = computeFingerprint({ ...BASE, languageHeader: 'en-US' });
		expect(nlHash).not.toBe(enHash);
	});
});
