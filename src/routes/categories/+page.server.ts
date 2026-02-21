import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { createSession, getSession, updateSession, deleteSession } from './game-store.ts';

export const prerender = false;

const COOKIE_NAME = 'categories-session';
const COOKIE_OPTS = {
	path: '/categories',
	httpOnly: true,
	sameSite: 'lax',
	maxAge: 60 * 60 * 24 // 24 hours
} as const;

async function generatePuzzle(): Promise<{ word: string; clues: string[] }> {
	const apiUrl = env.OLLAMA_API_URL || 'http://localhost:11434';

	const systemPrompt = `You are a puzzle creator. When asked, you output ONLY valid JSON and nothing else.`;

	const userPrompt = `Create a word association puzzle. 
Choose an interesting, common English word or short phrase (1-3 words) as the secret answer.
Then create exactly 5 clues for it.
- The clues go from HARDEST (most abstract/indirect) to EASIEST (most obvious).
- Each clue is 1-5 words only.
- The clues should evoke associations with the word but not directly state its meaning.

Respond with ONLY this JSON, no other text:
{"word": "your answer here", "clues": ["hardest", "clue 2", "clue 3", "clue 4", "easiest"]}`;

	const res = await fetch(apiUrl + '/api/chat', {
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

	const parsed = JSON.parse(jsonMatch[0]) as { word: string; clues: string[] };

	if (!parsed.word || !Array.isArray(parsed.clues) || parsed.clues.length !== 5) {
		throw new Error('AI returned unexpected puzzle format');
	}

	return { word: parsed.word.trim(), clues: parsed.clues.map((c) => c.trim()) };
}

export const load = (async ({ cookies }) => {
	const sessionId = cookies.get(COOKIE_NAME);
	let game = sessionId ? getSession(sessionId) : null;

	if (!game) {
		const puzzle = await generatePuzzle();
		const newId = createSession({
			word: puzzle.word,
			clues: puzzle.clues,
			revealed: 1,
			solved: false,
			failed: false,
			previousGuesses: []
		});
		cookies.set(COOKIE_NAME, newId, COOKIE_OPTS);
		game = getSession(newId)!;
	}

	// The word stays on the server; only send it once the game is over
	return {
		clues: game.clues,
		revealed: game.revealed,
		solved: game.solved,
		failed: game.failed,
		previousGuesses: game.previousGuesses,
		word: game.solved || game.failed ? game.word : null
	};
}) satisfies PageServerLoad;

export const actions = {
	guess: async ({ request, cookies }) => {
		const sessionId = cookies.get(COOKIE_NAME);
		const game = sessionId ? getSession(sessionId) : null;
		if (!game || game.solved || game.failed) return;

		const formData = await request.formData();
		const guess = (formData.get('guess') as string)?.trim().toLowerCase();
		if (!guess) return;

		const correct = guess === game.word.toLowerCase();

		if (correct) {
			updateSession(sessionId!, { solved: true });
		} else {
			const previousGuesses = [...game.previousGuesses, guess];
			if (game.revealed < 5) {
				updateSession(sessionId!, { previousGuesses, revealed: game.revealed + 1 });
			} else {
				updateSession(sessionId!, { previousGuesses, failed: true });
			}
		}
	},

	newGame: async ({ cookies }) => {
		const sessionId = cookies.get(COOKIE_NAME);
		if (sessionId) {
			deleteSession(sessionId);
			cookies.delete(COOKIE_NAME, { path: '/categories' });
		}
	}
} satisfies Actions;
