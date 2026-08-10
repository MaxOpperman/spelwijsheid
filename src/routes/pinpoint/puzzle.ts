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

export async function generatePuzzle(locale: Locale): Promise<{ word: string; clues: string[] }> {
	if (locale !== Locale.NL_NL && locale !== Locale.EN_GB && locale !== Locale.EN_US) {
		throw new Error('Invalid locale');
	}

	const apiUrl = env.OLLAMA_API_URL || 'http://localhost:11434';
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
	try {
		res = await fetch(apiUrl + '/api/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				model: env.OLLAMA_MODEL || 'gpt-oss',
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt }
				],
				options: {
					temperature: 1.5,
					top_p: 0.9
				},
				stream: false
			})
		});
	} catch (err) {
		const cause = err instanceof Error ? (err.cause ?? err) : err;
		const causeMsg = cause instanceof Error ? cause.message : String(cause);
		throw new Error(`AI API fetch failed [url=${apiUrl}/api/chat]: ${causeMsg}`, { cause: err });
	}

	if (!res.ok) {
		throw new Error(`AI API returned ${res.status}`);
	}

	const data = await res.json();
	return parsePuzzleResponse(String(data?.message?.content ?? ''));
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
