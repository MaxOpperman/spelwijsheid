import { UAParser } from 'ua-parser-js';
import maxmind, { type AsnResponse, type CityResponse, type Reader } from 'maxmind';
import { createHash } from 'crypto';
import { env } from '$env/dynamic/private';

export interface DeviceInfo {
	browser: string | null;
	browserVersion: string | null;
	os: string | null;
	osVersion: string | null;
	deviceType: string | null;
	deviceVendor: string | null;
	deviceModel: string | null;
}

export interface GeoInfo {
	continent: string | null;
	continentCode: string | null;
	euMember: boolean | null;
	country: string | null;
	registeredCountry: string | null;
	region: string | null;
	regionCode: string | null;
	subregion: string | null;
	city: string | null;
	postalCode: string | null;
	latitude: number | null;
	longitude: number | null;
	accuracyRadius: number | null;
	geoTimezone: string | null;
}

/** Bump to invalidate all stored fingerprints when the signal set changes. */
export const FINGERPRINT_VERSION = '2';

// Server-side salt so a stored fingerprint hash is not a portable cross-site
// identifier. Override in production via the FINGERPRINT_SALT env var.
const FINGERPRINT_SALT = env.FINGERPRINT_SALT ?? 'spelwijsheid-fp';

export interface FingerprintSignals {
	os: string | null;
	osVersion: string | null;
	browser: string | null;
	browserVersion: string | null;
	deviceType: string | null;
	deviceVendor: string | null;
	deviceModel: string | null;
	cpuArch: string | null;
	cpuCores: number | null;
	deviceMemory: number | null;
	screenW: number | null;
	screenH: number | null;
	dpr: number | null;
	colorDepth: number | null;
	pointerCoarse: boolean | null;
	hoverNone: boolean | null;
	timezone: string | null;
	languageHeader: string | null;
	colorScheme: string | null;
}

function majorVersion(v: string | null): string {
	return v ? (v.split('.')[0] ?? '') : '';
}

/**
 * Deterministic, salted fingerprint of stable-ish device signals. Returns null
 * when there is too little signal to be meaningful, so near-empty instances are
 * never coupled together.
 */
export function computeFingerprint(signals: FingerprintSignals): string | null {
	const parts = [
		signals.os ?? '',
		majorVersion(signals.osVersion),
		signals.browser ?? '',
		majorVersion(signals.browserVersion),
		signals.deviceType ?? '',
		signals.deviceVendor ?? '',
		signals.deviceModel ?? '',
		signals.cpuArch ?? '',
		signals.cpuCores != null ? String(signals.cpuCores) : '',
		signals.deviceMemory != null ? String(signals.deviceMemory) : '',
		signals.screenW != null ? String(signals.screenW) : '',
		signals.screenH != null ? String(signals.screenH) : '',
		signals.dpr != null ? String(signals.dpr) : '',
		signals.colorDepth != null ? String(signals.colorDepth) : '',
		signals.pointerCoarse != null ? String(signals.pointerCoarse) : '',
		signals.hoverNone != null ? String(signals.hoverNone) : '',
		signals.timezone ?? '',
		(signals.languageHeader ?? '').split(',')[0]?.trim() ?? '',
		signals.colorScheme ?? ''
	];
	// Require a minimum amount of non-empty signal before we trust a match.
	const nonEmpty = parts.filter((p) => p !== '').length;
	if (nonEmpty < 3) return null;
	const material = `${FINGERPRINT_VERSION}|${FINGERPRINT_SALT}|${parts.join('|')}`;
	return createHash('sha256').update(material).digest('hex');
}

/**
 * Parse browser and operating system from a User-Agent header.
 */
export function parseUserAgent(userAgent: string | null): DeviceInfo {
	if (!userAgent) {
		return {
			browser: null,
			browserVersion: null,
			os: null,
			osVersion: null,
			deviceType: null,
			deviceVendor: null,
			deviceModel: null
		};
	}
	const parsed = UAParser(userAgent);
	return {
		browser: parsed.browser.name ?? null,
		browserVersion: parsed.browser.version ?? null,
		os: parsed.os.name ?? null,
		osVersion: parsed.os.version ?? null,
		deviceType: parsed.device.type ?? null,
		deviceVendor: parsed.device.vendor ?? null,
		deviceModel: parsed.device.model ?? null
	};
}

export interface ClientHints {
	cpuArch: string | null;
	osPlatformVersion: string | null;
	browserFullVersion: string | null;
}

/**
 * Read structured client hints sent by the browser (only present after the
 * browser has processed an `Accept-CH` response header for at least one prior
 * navigation).
 */
export function parseClientHints(headers: Headers): ClientHints {
	return {
		cpuArch: headers.get('sec-ch-ua-arch'),
		osPlatformVersion: headers.get('sec-ch-ua-platform-version'),
		browserFullVersion: headers.get('sec-ch-ua-full-version-list')
	};
}

/**
 * Extract the client IP from request headers, honouring a reverse proxy.
 * `getClientAddress` is passed in from the SvelteKit request event.
 */
export function getClientIp(headers: Headers, getClientAddress: () => string): string | null {
	const forwarded = headers.get('x-forwarded-for');
	if (forwarded) {
		// First entry is the original client.
		const first = forwarded.split(',')[0]?.trim();
		if (first) return first;
	}
	const realIp = headers.get('x-real-ip');
	if (realIp) return realIp.trim();
	try {
		return getClientAddress();
	} catch {
		return null;
	}
}

let geoReader: Reader<CityResponse> | null = null;
let geoLoadAttempted = false;

async function getGeoReader(): Promise<Reader<CityResponse> | null> {
	if (geoLoadAttempted) return geoReader;
	geoLoadAttempted = true;
	const dbPath = env.GEOIP_DB_PATH;
	if (!dbPath) return null;
	try {
		geoReader = await maxmind.open<CityResponse>(dbPath);
	} catch {
		geoReader = null;
	}
	return geoReader;
}

let asnReader: Reader<AsnResponse> | null = null;
let asnLoadAttempted = false;

async function getAsnReader(): Promise<Reader<AsnResponse> | null> {
	if (asnLoadAttempted) return asnReader;
	asnLoadAttempted = true;
	const dbPath = env.GEOIP_ASN_DB_PATH;
	if (!dbPath) return null;
	try {
		asnReader = await maxmind.open<AsnResponse>(dbPath);
	} catch {
		asnReader = null;
	}
	return asnReader;
}

export interface AsnInfo {
	isp: string | null;
	asn: number | null;
}

/**
 * Resolve the Internet Service Provider (ASN organisation) and ASN number for
 * an IP using an offline MaxMind GeoLite2-ASN database.
 */
export async function lookupIsp(ip: string | null): Promise<AsnInfo> {
	const empty: AsnInfo = { isp: null, asn: null };
	if (!ip) return empty;
	const reader = await getAsnReader();
	if (!reader) return empty;
	try {
		const result = reader.get(ip);
		return {
			isp: result?.autonomous_system_organization ?? null,
			asn: result?.autonomous_system_number ?? null
		};
	} catch {
		return empty;
	}
}

/**
 * Resolve an approximate location from an IP using an offline MaxMind GeoLite2
 * database. Returns nulls if the database is unavailable or the IP is private.
 */
export async function lookupGeo(ip: string | null): Promise<GeoInfo> {
	const empty: GeoInfo = {
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
	};
	if (!ip) return empty;
	const reader = await getGeoReader();
	if (!reader) return empty;
	try {
		const result = reader.get(ip);
		if (!result) return empty;
		return {
			continent: result.continent?.names?.en ?? null,
			continentCode: result.continent?.code ?? null,
			euMember: result.country?.is_in_european_union ?? null,
			country: result.country?.names?.en ?? null,
			registeredCountry: result.registered_country?.names?.en ?? null,
			region: result.subdivisions?.[0]?.names?.en ?? null,
			regionCode: result.subdivisions?.[0]?.iso_code ?? null,
			subregion: result.subdivisions?.[1]?.names?.en ?? null,
			city: result.city?.names?.en ?? null,
			postalCode: result.postal?.code ?? null,
			latitude: result.location?.latitude ?? null,
			longitude: result.location?.longitude ?? null,
			accuracyRadius: result.location?.accuracy_radius ?? null,
			geoTimezone: result.location?.time_zone ?? null
		};
	} catch {
		return empty;
	}
}
