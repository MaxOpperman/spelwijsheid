import { createWriteStream, writeFileSync } from 'fs';
import { mkdir } from 'fs/promises';
import { pipeline } from 'stream/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const NL_WORDLIST_URL =
	'https://raw.githubusercontent.com/OpenTaal/opentaal-wordlist/master/wordlist.txt';
const NL_LICENSE_URL =
	'https://raw.githubusercontent.com/OpenTaal/opentaal-wordlist/master/LICENSE.txt';
const NL_OUTPUT_PATH = fileURLToPath(new URL('../static/wordlist.txt', import.meta.url));

/**
 * Hunspell .dic dictionaries from wooorm/dictionaries.
 * These provide distinct, curated word lists for each English locale.
 */
const EN_US_DIC_URL =
	'https://raw.githubusercontent.com/wooorm/dictionaries/main/dictionaries/en/index.dic';
const EN_GB_DIC_URL =
	'https://raw.githubusercontent.com/wooorm/dictionaries/main/dictionaries/en-GB/index.dic';
const EN_US_OUTPUT_PATH = fileURLToPath(new URL('../static/wordlist-en-us.txt', import.meta.url));
const EN_GB_OUTPUT_PATH = fileURLToPath(new URL('../static/wordlist-en-gb.txt', import.meta.url));

async function downloadFile(url, outputPath) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to download ${url}: ${response.statusText}`);
	}
	const fileStream = createWriteStream(outputPath);
	await pipeline(response.body, fileStream);
}

/**
 * Parse a Hunspell .dic file and return an array of unique lowercase alphabetic words.
 *
 * Hunspell .dic format:
 *   Line 1 : word count (skip)
 *   Line N : word[/affixes]   – everything after the first '/' is stripped
 */
function parseHunspellDic(content) {
	const lines = content.split('\n');
	// Skip the first line (word count header)
	const words = lines
		.slice(1)
		.map((line) => {
			const slashIndex = line.indexOf('/');
			return (slashIndex !== -1 ? line.slice(0, slashIndex) : line).trim().toLowerCase();
		})
		.filter((word) => /^[a-z]+$/.test(word));

	return [...new Set(words)];
}

async function downloadEnglishWordlist(url, outputPath, label) {
	console.log(`Downloading ${label} wordlist (wooorm/dictionaries)...`);
	console.log(`URL: ${url}`);
	console.log(`Output: ${outputPath}`);

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to download ${url}: ${response.statusText}`);
	}
	const content = await response.text();
	const words = parseHunspellDic(content);
	writeFileSync(outputPath, words.join('\n'), 'utf-8');
	console.log(`✓ ${label} wordlist downloaded successfully! (${words.length} words)`);
}

async function downloadWordlists() {
	try {
		// Ensure the static directory exists
		await mkdir(dirname(NL_OUTPUT_PATH), { recursive: true });

		// Download Dutch wordlist (OpenTaal)
		console.log('Downloading OpenTaal Dutch wordlist...');
		console.log(`URL: ${NL_WORDLIST_URL}`);
		console.log(`Output: ${NL_OUTPUT_PATH}`);

		const licenseResponse = await fetch(NL_LICENSE_URL);
		if (!licenseResponse.ok) {
			throw new Error(`Failed to download license: ${licenseResponse.statusText}`);
		}
		const licensePath = fileURLToPath(new URL('../static/LICENSE.md', import.meta.url));
		const licenseStream = createWriteStream(licensePath);
		await pipeline(licenseResponse.body, licenseStream);

		await downloadFile(NL_WORDLIST_URL, NL_OUTPUT_PATH);
		console.log('✓ Dutch wordlist downloaded successfully!');

		// Download English wordlists (distinct dictionaries per locale)
		await downloadEnglishWordlist(EN_US_DIC_URL, EN_US_OUTPUT_PATH, 'English (US)');
		await downloadEnglishWordlist(EN_GB_DIC_URL, EN_GB_OUTPUT_PATH, 'English (GB)');
	} catch (error) {
		console.error('Error downloading wordlists:', error);
		process.exit(1);
	}
}

downloadWordlists();
