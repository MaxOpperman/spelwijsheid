import type { Cookies } from '@sveltejs/kit';
import { isCorrectGuess } from '$lib/utils';
import { createInitialSession, generatePuzzle, getLocaleFromCookies } from './puzzle.ts';
import {
	clearGenerationState,
	deleteSession,
	getGenerationState,
	getSession,
	setGenerationState,
	setSession,
	updateSession
} from './game-store.ts';

const generationTokens = new Map<string, number>();

export function getLoadState(game: ReturnType<typeof getSession>, uid: string) {
	const generation = getGenerationState(uid);
	if (!game) {
		return {
			started: false as const,
			generating: generation === 'generating',
			generationFailed: generation === 'failed'
		};
	}

	return {
		started: true as const,
		generating: generation === 'generating',
		generationFailed: generation === 'failed',
		clues: game.clues,
		revealed: game.revealed,
		solved: game.solved,
		failed: game.failed,
		previousGuesses: game.previousGuesses,
		word: game.solved || game.failed ? game.word : null
	};
}

export function startNewGame(cookies: Cookies, uid: string): void {
	if (getGenerationState(uid) === 'generating') return;

	const token = (generationTokens.get(uid) ?? 0) + 1;
	generationTokens.set(uid, token);
	setGenerationState(uid, 'generating');

	const locale = getLocaleFromCookies(cookies);
	void generatePuzzle(locale)
		.then((puzzle) => {
			if (generationTokens.get(uid) !== token) return;
			setSession(uid, createInitialSession(puzzle.word, puzzle.clues));
			clearGenerationState(uid);
		})
		.catch(() => {
			if (generationTokens.get(uid) === token) setGenerationState(uid, 'failed');
		});
}

export async function applyGuess(
	uid: string,
	guessInput: FormDataEntryValue | null
): Promise<void> {
	const game = getSession(uid);
	if (!game || game.solved || game.failed) return;

	const guess = typeof guessInput === 'string' ? guessInput.trim().toLowerCase() : '';
	if (!guess) return;

	if (isCorrectGuess(guess, game.word)) {
		updateSession(uid, { solved: true });
		return;
	}

	const previousGuesses = [...game.previousGuesses, guess];
	if (game.revealed < 5) {
		updateSession(uid, { previousGuesses, revealed: game.revealed + 1 });
	} else {
		updateSession(uid, { previousGuesses, failed: true });
	}
}

export function endGame(uid: string): void {
	generationTokens.set(uid, (generationTokens.get(uid) ?? 0) + 1);
	clearGenerationState(uid);
	deleteSession(uid);
}
