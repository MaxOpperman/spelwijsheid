import type { Cookies } from '@sveltejs/kit';
import { isCorrectGuess } from '$lib/utils';
import { createInitialSession, generatePuzzle, getLocaleFromCookies } from './puzzle.ts';
import { deleteSession, getSession, setSession, updateSession } from './game-store.ts';

export function getLoadState(game: ReturnType<typeof getSession>) {
	if (!game) {
		return { started: false as const };
	}

	return {
		started: true as const,
		clues: game.clues,
		revealed: game.revealed,
		solved: game.solved,
		failed: game.failed,
		previousGuesses: game.previousGuesses,
		word: game.solved || game.failed ? game.word : null
	};
}

export async function startNewGame(cookies: Cookies, uid: string): Promise<void> {
	const locale = getLocaleFromCookies(cookies);
	const puzzle = await generatePuzzle(locale);
	setSession(uid, createInitialSession(puzzle.word, puzzle.clues));
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
	deleteSession(uid);
}
