export interface GameState {
	word: string;
	clues: string[];
	revealed: number;
	solved: boolean;
	failed: boolean;
	previousGuesses: string[];
	createdAt: number;
}

// Server-side in-memory store — the answer never leaves the server.
// Keyed by the visitor's persistent `uid` so no extra cookie is needed.
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

/** Create or replace the session for the given id (the visitor's uid). */
export function setSession(id: string, state: Omit<GameState, 'createdAt'>): void {
	pruneExpired();
	store.set(id, { ...state, createdAt: Date.now() });
}

export function getSession(id: string): GameState | null {
	const state = store.get(id) ?? null;
	if (state && state.createdAt < Date.now() - SESSION_TTL_MS) {
		store.delete(id);
		return null;
	}
	return state;
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
