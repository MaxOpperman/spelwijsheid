import { randomUUID } from 'crypto';

export interface GameState {
	word: string;
	clues: string[];
	revealed: number;
	solved: boolean;
	failed: boolean;
	previousGuesses: string[];
	createdAt: number;
}

// Server-side in-memory store — the answer never leaves the server
const store = new Map<string, GameState>();

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Periodically clean up expired sessions
function pruneExpired() {
	const cutoff = Date.now() - SESSION_TTL_MS;
	for (const [id, state] of store) {
		if (state.createdAt < cutoff) {
			store.delete(id);
		}
	}
}

export function createSession(state: Omit<GameState, 'createdAt'>): string {
	pruneExpired();
	const id = randomUUID();
	store.set(id, { ...state, createdAt: Date.now() });
	return id;
}

export function getSession(id: string): GameState | null {
	return store.get(id) ?? null;
}

export function updateSession(id: string, patch: Partial<GameState>): void {
	const existing = store.get(id);
	if (existing) {
		store.set(id, { ...existing, ...patch });
	}
}

export function deleteSession(id: string): void {
	store.delete(id);
}
