import { describe, it, expect, vi } from 'vitest';

// analytics.ts imports `$env/dynamic/private`, which is a SvelteKit virtual
// module that does not resolve under plain vitest. Stub it before importing.
vi.mock('$env/dynamic/private', () => ({ env: {} }));

const { parseUserAgent, getClientIp } = await import('../src/lib/server/analytics');

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
