import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { pipeline } from 'stream/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const NL_WORDLIST_URL =
	'https://raw.githubusercontent.com/OpenTaal/opentaal-wordlist/master/wordlist.txt';
const NL_LICENSE_URL =
	'https://raw.githubusercontent.com/OpenTaal/opentaal-wordlist/master/LICENSE.txt';
const NL_OUTPUT_PATH = fileURLToPath(new URL('../static/wordlist.txt', import.meta.url));

const EN_WORDLIST_URL =
	'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt';
const EN_OUTPUT_PATH = fileURLToPath(new URL('../static/wordlist-en.txt', import.meta.url));

async function downloadFile(url, outputPath) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to download ${url}: ${response.statusText}`);
	}
	const fileStream = createWriteStream(outputPath);
	await pipeline(response.body, fileStream);
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

		// Download English wordlist (dwyl/english-words)
		console.log('Downloading English wordlist (dwyl/english-words)...');
		console.log(`URL: ${EN_WORDLIST_URL}`);
		console.log(`Output: ${EN_OUTPUT_PATH}`);

		await downloadFile(EN_WORDLIST_URL, EN_OUTPUT_PATH);
		console.log('✓ English wordlist downloaded successfully!');
	} catch (error) {
		console.error('Error downloading wordlists:', error);
		process.exit(1);
	}
}

downloadWordlists();
