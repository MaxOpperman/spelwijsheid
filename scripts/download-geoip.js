// Standalone GeoLite2 database downloader.
//
// Fetches the MaxMind GeoLite2-City and GeoLite2-ASN databases using the free
// MaxMind account credentials and extracts the .mmdb files so the server can
// resolve approximate locations and ISPs offline. Runs at container startup
// (see Dockerfile CMD).
//
// Credentials come from the environment:
//   MAXMIND_ACCOUNT_ID   – your MaxMind account id
//   MAXMIND_LICENSE_KEY  – a license key generated in your MaxMind account
//   GEOIP_DB_PATH        – where to write the City .mmdb (default: /app/geoip/GeoLite2-City.mmdb)
//   GEOIP_ASN_DB_PATH    – where to write the ASN .mmdb  (default: /app/geoip/GeoLite2-ASN.mmdb)
//
// If the credentials are missing the script exits successfully without doing
// anything — geolocation simply stays disabled and location fields are empty.
import { createWriteStream } from 'fs';
import { mkdir, stat, writeFile, rm, readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { tmpdir } from 'os';
import { pathToFileURL } from 'url';
import { pipeline } from 'stream/promises';
import { createGunzip } from 'zlib';
import { Buffer } from 'buffer';

const EDITION_CITY = 'GeoLite2-City';
const EDITION_ASN = 'GeoLite2-ASN';
const DOWNLOAD_URL_CITY = `https://download.maxmind.com/geoip/databases/${EDITION_CITY}/download?suffix=tar.gz`;
const DOWNLOAD_URL_ASN = `https://download.maxmind.com/geoip/databases/${EDITION_ASN}/download?suffix=tar.gz`;
const DEFAULT_DB_PATH = '/app/geoip/GeoLite2-City.mmdb';
const DEFAULT_ASN_DB_PATH = '/app/geoip/GeoLite2-ASN.mmdb';
// Re-download when the existing database is older than this (MaxMind refreshes
// GeoLite2 a couple of times per week).
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const accountId = process.env.MAXMIND_ACCOUNT_ID;
const licenseKey = process.env.MAXMIND_LICENSE_KEY;
const dbPath = process.env.GEOIP_DB_PATH || DEFAULT_DB_PATH;
const asnDbPath = process.env.GEOIP_ASN_DB_PATH || DEFAULT_ASN_DB_PATH;

/** @param {string} path */
async function isFresh(path) {
	try {
		const info = await stat(path);
		return Date.now() - info.mtimeMs < MAX_AGE_MS;
	} catch {
		return false;
	}
}

/**
 * Minimal POSIX tar extractor: scans the (already gunzipped) buffer for the
 * first entry whose name ends in `.mmdb` and returns its contents.
 * @param {Buffer} buffer
 * @returns {Buffer | null}
 */
export function extractMmdbFromTar(buffer) {
	let offset = 0;
	while (offset + 512 <= buffer.length) {
		const header = buffer.subarray(offset, offset + 512);
		// A pair of zero-filled blocks marks the end of the archive.
		if (header.every((byte) => byte === 0)) break;

		const name = header.subarray(0, 100).toString('utf-8').replace(/\0.*$/, '');
		const sizeField = header.subarray(124, 136).toString('utf-8').replace(/\0.*$/, '').trim();
		const size = parseInt(sizeField, 8) || 0;

		const dataStart = offset + 512;
		if (name.endsWith('.mmdb')) {
			return buffer.subarray(dataStart, dataStart + size);
		}

		// Advance past this entry's data, rounded up to the next 512-byte block.
		offset = dataStart + Math.ceil(size / 512) * 512;
	}
	return null;
}

async function downloadEdition(edition, url, targetPath, auth) {
	if (await isFresh(targetPath)) {
		console.log(`GeoLite2 ${edition} database is recent (${targetPath}); skipping download.`);
		return;
	}

	console.log(`Downloading MaxMind ${edition} database...`);
	const response = await fetch(url, {
		headers: { Authorization: `Basic ${auth}` }
	});

	if (!response.ok) {
		throw new Error(
			`Failed to download ${edition} database: ${response.status} ${response.statusText}`
		);
	}

	const tmpTar = join(tmpdir(), `geolite2-${edition}-${Date.now()}.tar`);
	try {
		if (!response.body) {
			throw new Error(`${edition} download returned an empty response body.`);
		}
		await pipeline(response.body, createGunzip(), createWriteStream(tmpTar));
		const tarBuffer = await readFile(tmpTar);
		const mmdb = extractMmdbFromTar(tarBuffer);
		if (!mmdb) {
			throw new Error(`No .mmdb entry found in the ${edition} archive.`);
		}
		await mkdir(dirname(targetPath), { recursive: true });
		await writeFile(targetPath, mmdb);
		console.log(`✓ ${edition} database written to ${targetPath} (${mmdb.length} bytes).`);
	} finally {
		await rm(tmpTar, { force: true });
	}
}

async function downloadGeoip() {
	if (!accountId) {
		console.log('MaxMind account ID not set; skipping GeoLite2 download (geolocation disabled).');
	}
	if (!licenseKey) {
		console.log('MaxMind license key not set; skipping GeoLite2 download (geolocation disabled).');
	}
	if (!accountId || !licenseKey) {
		return;
	}

	const auth = Buffer.from(`${accountId}:${licenseKey}`).toString('base64');
	await Promise.all([
		downloadEdition('GeoLite2-City', DOWNLOAD_URL_CITY, dbPath, auth),
		downloadEdition('GeoLite2-ASN', DOWNLOAD_URL_ASN, asnDbPath, auth)
	]);
}

// Only run the download when executed directly (e.g. `node scripts/download-geoip.js`),
// so the module can be imported in tests without side effects.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	try {
		await downloadGeoip();
	} catch (err) {
		// Never block application startup on a geolocation failure.
		const message = err instanceof Error ? err.message : String(err);
		console.error('GeoLite2 download failed (continuing without geolocation):', message);
	}
}
