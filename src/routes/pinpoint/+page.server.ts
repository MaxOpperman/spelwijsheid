import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { setSession, getSession, updateSession, deleteSession } from './game-store.ts';
import { isCorrectGuess } from '$lib/utils';
import type { Cookies } from '@sveltejs/kit';
import { Locale } from '$lib/stores/locale.ts';

export const prerender = false;

// Helper to get locale from cookies or fallback
function getLocaleFromCookies(cookies: Cookies): Locale {
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

async function generatePuzzle(locale: Locale): Promise<{ word: string; clues: string[] }> {
	// typeguard function input to disable prompt attacks
	if (locale !== Locale.NL_NL && locale !== Locale.EN_GB && locale !== Locale.EN_US) {
		throw new Error('Invalid locale');
	}
	const apiUrl = env.OLLAMA_API_URL || 'http://localhost:11434';

	// Language-specific instructions
	let languageInstruction = '';
	if (locale === Locale.NL_NL) {
		languageInstruction = '\nAll clues AND the answer must be in Dutch.';
	} else if (locale === Locale.EN_GB || locale === Locale.EN_US) {
		languageInstruction = '\nAll clues and the answer must be in English.';
	}

	const systemPrompt = `You are a puzzle creator for a guessing game. When asked, you output ONLY valid JSON and nothing else. ${languageInstruction}`;

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
	const content: string = data?.message?.content ?? '';

	// Extract JSON from the response (model may wrap it in markdown fences)
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

	return { word: parsed.word.trim(), clues: parsed.clues.map((c) => c.trim()) };
}

async function startNewGame(cookies: Cookies, uid: string): Promise<void> {
	const locale = getLocaleFromCookies(cookies);
	const puzzle = await generatePuzzle(locale);
	setSession(uid, {
		word: puzzle.word,
		clues: puzzle.clues,
		revealed: 1,
		solved: false,
		failed: false,
		previousGuesses: []
	});
}

export const load = (async ({ locals }) => {
	const game = getSession(locals.uid);

	if (!game) {
		return { started: false as const };
	}

	// The word stays on the server; only send it once the game is over
	return {
		started: true as const,
		clues: game.clues,
		revealed: game.revealed,
		solved: game.solved,
		failed: game.failed,
		previousGuesses: game.previousGuesses,
		word: game.solved || game.failed ? game.word : null
	};
}) satisfies PageServerLoad;

export const actions = {
	startGame: async ({ cookies, locals }) => {
		await startNewGame(cookies, locals.uid);
	},

	guess: async ({ request, locals }) => {
		const game = getSession(locals.uid);
		if (!game || game.solved || game.failed) return;

		const formData = await request.formData();
		const guess = (formData.get('guess') as string)?.trim().toLowerCase();
		if (!guess) return;

		const correct = isCorrectGuess(guess, game.word);

		if (correct) {
			updateSession(locals.uid, { solved: true });
		} else {
			const previousGuesses = [...game.previousGuesses, guess];
			if (game.revealed < 5) {
				updateSession(locals.uid, { previousGuesses, revealed: game.revealed + 1 });
			} else {
				updateSession(locals.uid, { previousGuesses, failed: true });
			}
		}
	},

	pausePlaying: async ({ locals }) => {
		deleteSession(locals.uid);
	},

	newGame: async ({ cookies, locals }) => {
		deleteSession(locals.uid);
		await startNewGame(cookies, locals.uid);
	}
} satisfies Actions;
