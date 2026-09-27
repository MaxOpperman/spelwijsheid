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
		return '\nAll clues AND the answer must be in Dutch.';
	}
	return '\nAll clues and the answer must be in English.';
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

	if (!parsed.word || !Array.isArray(parsed.clues) || parsed.clues.length !== 5) {
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
	const systemPrompt = `You are a puzzle creator for a guessing game. When asked, you output ONLY valid JSON and nothing else. ${buildLanguageInstruction(locale)}`;
	const userPrompt = `Create a guessing puzzle similar to LinkedIn Crossclimb.

Step 1 — Choose a category or phrase pattern.

Step 2 — The answer must be a single word whenever possible.

Examples:
- dresses
- senses
- statues
- mushrooms
- lion (for phrases like "sea lion", "mountain lion")

Step 3 — Generate exactly 5 clues.

STRICT CLUE RULES:
- Clues must be examples, members, or phrases that belong to the category.
- Clues MUST NOT define or describe the answer.
- Clues MUST NOT contain the answer word itself.
- Clues must be 1-5 words.
- Clues must be concrete nouns or short phrases (not explanations).

Difficulty:
- Clue 1 = most obscure example
- Clue 3 = moderately recognizable
- Clue 5 = very recognizable

Clue 5 rule:
- Must include a short explanatory hint in parentheses.

Example structure:
{"word": "mushrooms", "clues": ["Enoki", "Oyster", "Shiitake", "White Button", "Portobello (large edible fungus)"]}

Output ONLY this JSON structure:
{"word": "your answer here", "clues": ["hardest", "clue 2", "clue 3", "clue 4", "easiest"]}`;

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
					temperature: 1.5,
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
