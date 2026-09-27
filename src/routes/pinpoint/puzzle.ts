import { env } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';
import { Locale } from '$lib/stores/locale.ts';

export function getLocaleFromCookies(cookies: Cookies): Locale {
	const cookieLocale = cookies.get('locale');
	if (
		cookieLocale === Locale.NL_NL ||
		cookieLocale === Locale.EN_GB ||
		cookieLocale === Locale.EN_US
	) {
		return cookieLocale as Locale;
	}
	return Locale.EN_US;
}

function buildLanguageInstruction(locale: Locale): string {
	if (locale === Locale.NL_NL) {
		return '\nThe answer and all clues must be in Dutch.';
	}
	return '\nThe answer and all clues must be in English.';
}

function describeError(error: unknown): string {
	if (!(error instanceof Error)) return String(error);

	const details = [error.message];
	const errorCode = (error as Error & { code?: unknown }).code;
	if (errorCode) details.push(`code=${String(errorCode)}`);
	if (error.cause && error.cause !== error) {
		details.push(`cause=${describeError(error.cause)}`);
	}
	return details.join(', ');
}

function parsePuzzleResponse(content: string): { word: string; clues: string[] } {
	const jsonMatch = content.match(/\{[\s\S]*\}/);
	if (!jsonMatch) {
		throw new Error('AI did not return valid JSON');
	}

	let parsed: { word: string; clues: string[] };
	try {
		parsed = JSON.parse(jsonMatch[0]) as { word: string; clues: string[] };
	} catch (err) {
		throw new Error(
			'AI returned malformed JSON: ' + (err instanceof Error ? err.message : String(err)),
			{ cause: err }
		);
	}

	if (
		typeof parsed.word !== 'string' ||
		!parsed.word.trim() ||
		!Array.isArray(parsed.clues) ||
		parsed.clues.length !== 5 ||
		parsed.clues.some((clue) => typeof clue !== 'string' || !clue.trim())
	) {
		throw new Error('AI returned unexpected puzzle format');
	}

	return { word: parsed.word.trim(), clues: parsed.clues.map((clue) => clue.trim()) };
}

async function readStreamedResponse(response: Response): Promise<string> {
	const body = await response.text();
	return body
		.split('\n')
		.filter((line) => line.trim())
		.map((line) => JSON.parse(line) as { message?: { content?: string } })
		.map((chunk) => chunk.message?.content ?? '')
		.join('');
}

export async function generatePuzzle(locale: Locale): Promise<{ word: string; clues: string[] }> {
	if (locale !== Locale.NL_NL && locale !== Locale.EN_GB && locale !== Locale.EN_US) {
		throw new Error('Invalid locale');
	}

	const apiUrl = env.OLLAMA_API_URL || 'http://localhost:11434';
	const endpoint = apiUrl + '/api/chat';
	const model = env.OLLAMA_MODEL || 'gpt-oss';
	const timeoutMs = Number(env.OLLAMA_TIMEOUT_MS) || 240_000;
	const startedAt = Date.now();
	const systemPrompt = `You create puzzles for a guessing game. Output only valid JSON. Do not output any other text. ${buildLanguageInstruction(locale)}`;
	const userPrompt = `Create one guessing puzzle.

Choose one category. Choose one answer word for the category.
Examples of categories: dresses, senses, statues, mushrooms.
You can also choose a word used in phrases, such as lion in "sea lion".

Follow these rules:
1. Use the required language for the answer and all clues.
2. Use one common word for the answer.
3. Write exactly 5 clues.
4. Write 1 to 5 words in each clue.
5. Each clue must be an example, member, or phrase in the category.
6. Do not define or explain the answer.
7. Do not put the answer word in any clue.
8. Use nouns or short noun phrases. Do not use questions or sentences.
9. Use the least common example for clue 1.
10. Use a moderately common example for clue 3.
11. Use the most common example for clue 5.
12. Add a short hint in parentheses at the end of clue 5.
13. The hint must give information about clue 5. The hint must not give information about the answer.

Use this valid example as a model:
{"word":"mushrooms","clues":["Enoki","Oyster","Shiitake","White Button","Portobello (large edible fungus)"]}

Before you output, check these items:
- word is a string;
- clues is an array;
- clues has exactly 5 items;
- every clue is a string; and
- no clue contains the answer.

Output only one JSON object. Do not output Markdown, comments, or any other text.
Use exactly this format:
{"word":"answer","clues":["clue 1","clue 2","clue 3","clue 4","clue 5 (hint)"]}`;

	let res: Response;
	console.info(
		`[pinpoint] AI request started [url=${endpoint}, model=${model}, locale=${locale}, timeoutMs=${timeoutMs}]`
	);
	try {
		res = await fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			signal: AbortSignal.timeout(timeoutMs),
			body: JSON.stringify({
				model,
				format: 'json',
				think: false,
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt }
				],
				options: {
					temperature: 0.7,
					top_p: 0.9
				},
				stream: true
			})
		});
	} catch (err) {
		console.error(
			`[pinpoint] AI request failed [url=${endpoint}, model=${model}, locale=${locale}, timeoutMs=${timeoutMs}, durationMs=${Date.now() - startedAt}]: ${describeError(err)}`
		);
		throw new Error(`AI API fetch failed [url=${endpoint}]: ${describeError(err)}`, { cause: err });
	}

	console.info(
		`[pinpoint] AI response received [status=${res.status}, ok=${res.ok}, durationMs=${Date.now() - startedAt}]`
	);
	if (!res.ok) {
		throw new Error(`AI API returned ${res.status} ${res.statusText}`.trim());
	}

	try {
		const content = await readStreamedResponse(res);
		const puzzle = parsePuzzleResponse(content);
		console.info(
			`[pinpoint] AI response parsed [durationMs=${Date.now() - startedAt}, contentLength=${content.length}]`
		);
		return puzzle;
	} catch (err) {
		console.error(
			`[pinpoint] AI response processing failed [status=${res.status}, durationMs=${Date.now() - startedAt}]: ${describeError(err)}`
		);
		throw err;
	}
}

export function createInitialSession(word: string, clues: string[]) {
	return {
		word,
		clues,
		revealed: 1,
		solved: false,
		failed: false,
		previousGuesses: [] as string[]
	};
}
