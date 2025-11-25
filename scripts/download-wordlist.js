import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { pipeline } from 'stream/promises';
import { dirname } from 'path';

const WORDLIST_URL = 'https://raw.githubusercontent.com/OpenTaal/opentaal-wordlist/master/wordlist.txt';
const LICENSE_URL = 'https://raw.githubusercontent.com/OpenTaal/opentaal-wordlist/master/LICENSE.txt';
const OUTPUT_PATH = new URL('../static/wordlist.txt', import.meta.url).pathname.substring(1); // Remove leading slash on Windows

async function downloadWordlist() {
	console.log('Downloading OpenTaal wordlist...');
	console.log(`URL: ${WORDLIST_URL}`);
	console.log(`Output: ${OUTPUT_PATH}`);

	try {
		// Ensure the static directory exists
		await mkdir(dirname(OUTPUT_PATH), { recursive: true });

		// Download the license file
		const licenseResponse = await fetch(LICENSE_URL);
		if (!licenseResponse.ok) {
			throw new Error(`Failed to download license: ${licenseResponse.statusText}`);
		}
		const licensePath = new URL('../static/LICENSE.md', import.meta.url).pathname.substring(1);
		const licenseStream = createWriteStream(licensePath);
		await pipeline(licenseResponse.body, licenseStream);

		// Download the file
		const response = await fetch(WORDLIST_URL);
		
		if (!response.ok) {
			throw new Error(`Failed to download: ${response.statusText}`);
		}

		// Write to file
		const fileStream = createWriteStream(OUTPUT_PATH);
		await pipeline(response.body, fileStream);

		console.log('✓ Wordlist downloaded successfully!');
	} catch (error) {
		console.error('Error downloading wordlist:', error);
		process.exit(1);
	}
}

downloadWordlist();
