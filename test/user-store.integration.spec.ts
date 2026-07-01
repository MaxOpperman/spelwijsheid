import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { readdirSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join } from 'path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';

// A stable proxy is installed in place of the real `./db` module. It forwards
// every property access to the PGlite-backed Drizzle instance created in
// beforeAll. Using a proxy keeps the imported `db` binding identity constant
// while letting us wire up the real client asynchronously.
const { dbProxy, setReal } = vi.hoisted(() => {
	let real: Record<string | symbol, unknown> | null = null;
	const proxy = new Proxy(
		{},
		{
			get(_t, prop) {
				const value = real?.[prop];
				return typeof value === 'function' ? value.bind(real) : value;
			}
		}
	);
	return {
		dbProxy: proxy,
		setReal: (d: unknown) => (real = d as Record<string | symbol, unknown>)
	};
});

vi.mock('$lib/server/db', () => ({ db: dbProxy }));
vi.mock('../src/lib/server/db', () => ({ db: dbProxy }));
// analytics.ts (pulled in transitively) imports the SvelteKit `$env` virtual
// module, which has no resolver in the plain node test environment.
vi.mock('$env/dynamic/private', () => ({ env: {} }));

// Import the module under test *after* the mock is registered.
const store = await import('../src/lib/server/user');

let client: PGlite;

const MIGRATIONS_DIR = fileURLToPath(new URL('../drizzle', import.meta.url));

/** Concatenate every generated migration SQL file, in order. */
function allMigrationsSql(): string {
	return readdirSync(MIGRATIONS_DIR)
		.filter((f) => f.endsWith('.sql'))
		.sort()
		.map((f) => readFileSync(join(MIGRATIONS_DIR, f), 'utf-8'))
		.join('\n')
		.replaceAll('--> statement-breakpoint', '');
}

beforeAll(async () => {
	client = new PGlite();
	const db = drizzle(client);
	setReal(db);

	// Apply the real migration SQL (strip drizzle's statement-breakpoint markers).
	await client.exec(allMigrationsSql());
});

afterAll(async () => {
	await client.close();
});

beforeEach(async () => {
	// Reset all data between tests (cascades to game_states / game_results).
	await client.exec('TRUNCATE TABLE users, identities CASCADE;');
});

describe('getOrCreateUser', () => {
	it('creates a user with a generated id when none is given', async () => {
		const user = await store.getOrCreateUser(undefined);
		expect(user.id).toMatch(/^[0-9a-f-]{36}$/);
		expect(user.darkMode).toBe(false);
		expect(user.consentFunctional).toBe(false);
		expect(user.consentAnalytics).toBe(false);
	});

	it('creates a user with the provided id', async () => {
		const id = '11111111-1111-1111-1111-111111111111';
		const user = await store.getOrCreateUser(id);
		expect(user.id).toBe(id);
	});

	it('returns the existing user on a second call with the same id', async () => {
		const first = await store.getOrCreateUser(undefined);
		const second = await store.getOrCreateUser(first.id);
		expect(second.id).toBe(first.id);
		expect(second.createdAt.getTime()).toBe(first.createdAt.getTime());
	});
});

describe('user preferences', () => {
	it('persists dark mode', async () => {
		const user = await store.getOrCreateUser(undefined);
		await store.setDarkMode(user.id, true);
		const again = await store.getOrCreateUser(user.id);
		expect(again.darkMode).toBe(true);
	});

	it('persists locale', async () => {
		const user = await store.getOrCreateUser(undefined);
		await store.setLocale(user.id, 'nl-NL');
		const again = await store.getOrCreateUser(user.id);
		expect(again.locale).toBe('nl-NL');
	});

	it('persists consent and stamps consentUpdatedAt', async () => {
		const user = await store.getOrCreateUser(undefined);
		expect(user.consentUpdatedAt).toBeNull();
		await store.setConsent(user.id, { functional: true, analytics: true });
		const again = await store.getOrCreateUser(user.id);
		expect(again.consentFunctional).toBe(true);
		expect(again.consentAnalytics).toBe(true);
		expect(again.consentUpdatedAt).toBeInstanceOf(Date);
	});

	it('updates arbitrary analytics fields via updateUser', async () => {
		const user = await store.getOrCreateUser(undefined);
		await store.updateUser(user.id, {
			ip: '203.0.113.7',
			country: 'Netherlands',
			browser: 'Firefox',
			os: 'Windows',
			screenW: 1920,
			screenH: 1080
		});
		const again = await store.getOrCreateUser(user.id);
		expect(again.country).toBe('Netherlands');
		expect(again.browser).toBe('Firefox');
		expect(again.screenW).toBe(1920);
	});

	it('advances lastSeen on touchLastSeen', async () => {
		const user = await store.getOrCreateUser(undefined);
		await new Promise((r) => setTimeout(r, 5));
		await store.touchLastSeen(user.id);
		const again = await store.getOrCreateUser(user.id);
		expect(again.lastSeen.getTime()).toBeGreaterThanOrEqual(user.lastSeen.getTime());
	});
});

describe('functional preferences', () => {
	it('has sensible defaults for a fresh user', async () => {
		const user = await store.getOrCreateUser(undefined);
		expect(user.timezone).toBeNull();
		expect(user.reducedMotion).toBe(false);
		expect(user.highContrast).toBe(false);
		expect(user.soundEnabled).toBe(true);
		expect(user.onboardingCompleted).toBe(false);
	});

	it('persists functional preferences', async () => {
		const user = await store.getOrCreateUser(undefined);
		await store.setFunctionalPreferences(user.id, {
			timezone: 'Europe/Amsterdam',
			reducedMotion: true,
			highContrast: true,
			soundEnabled: false,
			onboardingCompleted: true
		});
		const again = await store.getOrCreateUser(user.id);
		expect(again.timezone).toBe('Europe/Amsterdam');
		expect(again.reducedMotion).toBe(true);
		expect(again.highContrast).toBe(true);
		expect(again.soundEnabled).toBe(false);
		expect(again.onboardingCompleted).toBe(true);
	});

	it('ignores an empty preferences patch', async () => {
		const user = await store.getOrCreateUser(undefined);
		await store.setFunctionalPreferences(user.id, {});
		const again = await store.getOrCreateUser(user.id);
		expect(again.soundEnabled).toBe(true);
	});
});

describe('engagement tracking', () => {
	it('increments the visit count and stamps lastActiveAt', async () => {
		const user = await store.getOrCreateUser(undefined);
		expect(user.visitCount).toBe(0);
		expect(user.lastActiveAt).toBeNull();
		await store.recordVisit(user.id);
		await store.recordVisit(user.id);
		const again = await store.getOrCreateUser(user.id);
		expect(again.visitCount).toBe(2);
		expect(again.lastActiveAt).toBeInstanceOf(Date);
	});

	it('starts a daily streak on the first recorded result', async () => {
		const user = await store.getOrCreateUser(undefined);
		await store.recordGameResult({ userId: user.id, game: 'wordle', won: true });
		const again = await store.getOrCreateUser(user.id);
		expect(again.currentStreak).toBe(1);
		expect(again.longestStreak).toBe(1);
		expect(again.lastStreakDate).toBe(new Date().toISOString().slice(0, 10));
	});

	it('does not advance the streak twice on the same day', async () => {
		const user = await store.getOrCreateUser(undefined);
		await store.recordGameResult({ userId: user.id, game: 'wordle', won: true });
		await store.recordGameResult({ userId: user.id, game: 'wordle', won: false });
		const again = await store.getOrCreateUser(user.id);
		expect(again.currentStreak).toBe(1);
	});
});

describe('consent compliance', () => {
	it('stamps the consent version and a retention window when analytics is granted', async () => {
		const user = await store.getOrCreateUser(undefined);
		await store.setConsent(user.id, { functional: true, analytics: true });
		const again = await store.getOrCreateUser(user.id);
		expect(again.consentVersion).toBeTruthy();
		expect(again.dataRetentionExpiresAt).toBeInstanceOf(Date);
		expect(again.dataRetentionExpiresAt!.getTime()).toBeGreaterThan(Date.now());
	});

	it('clears the retention window when analytics is declined', async () => {
		const user = await store.getOrCreateUser(undefined);
		await store.setConsent(user.id, { functional: true, analytics: false });
		const again = await store.getOrCreateUser(user.id);
		expect(again.consentVersion).toBeTruthy();
		expect(again.dataRetentionExpiresAt).toBeNull();
	});
});

describe('game state', () => {
	it('returns null when no state is stored', async () => {
		const user = await store.getOrCreateUser(undefined);
		expect(await store.getGameState(user.id, 'wordle')).toBeNull();
	});

	it('stores and reads back a JSON state', async () => {
		const user = await store.getOrCreateUser(undefined);
		const state = { board: [['a', 'b']], score: 42 };
		await store.setGameState(user.id, 'wordle', state, 'en-US');
		expect(await store.getGameState(user.id, 'wordle', 'en-US')).toEqual(state);
	});

	it('upserts existing state on conflict (same user/game/locale)', async () => {
		const user = await store.getOrCreateUser(undefined);
		await store.setGameState(user.id, 'wordle', { v: 1 }, 'en-US');
		await store.setGameState(user.id, 'wordle', { v: 2 }, 'en-US');
		expect(await store.getGameState(user.id, 'wordle', 'en-US')).toEqual({ v: 2 });
	});

	it('keeps states for different locales separate', async () => {
		const user = await store.getOrCreateUser(undefined);
		await store.setGameState(user.id, 'wordle', { v: 'us' }, 'en-US');
		await store.setGameState(user.id, 'wordle', { v: 'nl' }, 'nl-NL');
		expect(await store.getGameState(user.id, 'wordle', 'en-US')).toEqual({ v: 'us' });
		expect(await store.getGameState(user.id, 'wordle', 'nl-NL')).toEqual({ v: 'nl' });
	});

	it('clears stored state', async () => {
		const user = await store.getOrCreateUser(undefined);
		await store.setGameState(user.id, 'wordle', { v: 1 }, 'en-US');
		await store.clearGameState(user.id, 'wordle', 'en-US');
		expect(await store.getGameState(user.id, 'wordle', 'en-US')).toBeNull();
	});
});

describe('game results and stats', () => {
	it('reports zeroes for a user with no results', async () => {
		const user = await store.getOrCreateUser(undefined);
		const stats = await store.getGameStats(user.id, 'queens');
		expect(stats).toEqual({
			gamesPlayed: 0,
			gamesWon: 0,
			averageTimeMs: null,
			bestTimeMs: null
		});
	});

	it('counts played and won games', async () => {
		const user = await store.getOrCreateUser(undefined);
		await store.recordGameResult({ userId: user.id, game: 'queens', won: true, durationMs: 10000 });
		await store.recordGameResult({ userId: user.id, game: 'queens', won: false });
		await store.recordGameResult({ userId: user.id, game: 'queens', won: true, durationMs: 20000 });
		const stats = await store.getGameStats(user.id, 'queens');
		expect(stats.gamesPlayed).toBe(3);
		expect(stats.gamesWon).toBe(2);
	});

	it('averages duration over won games only', async () => {
		const user = await store.getOrCreateUser(undefined);
		await store.recordGameResult({ userId: user.id, game: 'queens', won: true, durationMs: 10000 });
		await store.recordGameResult({ userId: user.id, game: 'queens', won: true, durationMs: 30000 });
		// A lost game with a (smaller) duration must NOT lower the average.
		await store.recordGameResult({ userId: user.id, game: 'queens', won: false, durationMs: 1000 });
		const stats = await store.getGameStats(user.id, 'queens');
		expect(stats.averageTimeMs).toBe(20000);
		expect(stats.bestTimeMs).toBe(10000);
	});

	it('scopes stats by locale when a locale is given', async () => {
		const user = await store.getOrCreateUser(undefined);
		await store.recordGameResult({
			userId: user.id,
			game: 'wordle',
			locale: 'en-US',
			won: true,
			durationMs: 5000
		});
		await store.recordGameResult({
			userId: user.id,
			game: 'wordle',
			locale: 'nl-NL',
			won: true,
			durationMs: 9000
		});
		expect((await store.getGameStats(user.id, 'wordle', 'en-US')).gamesPlayed).toBe(1);
		expect((await store.getGameStats(user.id, 'wordle')).gamesPlayed).toBe(2);
	});

	it('removes results when the parent user is deleted (FK cascade)', async () => {
		const user = await store.getOrCreateUser(undefined);
		await store.recordGameResult({ userId: user.id, game: 'queens', won: true, durationMs: 1000 });
		await client.exec(`DELETE FROM users WHERE id = '${user.id}';`);
		const { rows } = await client.query('SELECT count(*)::int AS n FROM game_results;');
		expect((rows[0] as { n: number }).n).toBe(0);
	});
});

describe('cross-instance coupling', () => {
	const DESKTOP = {
		os: 'Windows',
		osVersion: '10',
		browser: 'Chrome',
		browserVersion: '120',
		deviceType: 'mobile',
		screenW: 1920,
		screenH: 1080,
		timezone: 'Europe/Amsterdam',
		ip: '203.0.113.7'
	};

	/** Create a consented instance with the given signals and couple it. */
	async function makeInstance(signals: Partial<typeof DESKTOP> = {}) {
		const u = await store.getOrCreateUser(undefined);
		await store.setConsent(u.id, { functional: true, analytics: true });
		await store.updateUser(u.id, { ...DESKTOP, ...signals });
		await store.coupleInstance(u.id);
		return u.id;
	}

	it('couples two instances with an identical fingerprint (strong) and shares preferences', async () => {
		const aId = await makeInstance();
		await store.setDarkMode(aId, true);

		const bId = await makeInstance();

		const a = await store.getOrCreateUser(aId);
		const b = await store.getOrCreateUser(bId);
		expect(b.identityId).toBe(a.identityId);
		expect(b.matchConfidence).toBe('strong');
		// B adopts the identity's shared dark-mode preference.
		expect(b.darkMode).toBe(true);
	});

	it('keeps instances with different fingerprints separate', async () => {
		const aId = await makeInstance();
		const bId = await makeInstance({
			os: 'Mac OS',
			browser: 'Safari',
			screenW: 1440,
			screenH: 900
		});

		const a = await store.getOrCreateUser(aId);
		const b = await store.getOrCreateUser(bId);
		expect(a.identityId).not.toBeNull();
		expect(b.identityId).not.toBeNull();
		expect(b.identityId).not.toBe(a.identityId);
		expect(b.matchConfidence).toBeNull();
	});

	it('weak-matches same IP + device without propagating preferences', async () => {
		const aId = await makeInstance();
		await store.setDarkMode(aId, true);

		// Same IP / OS / browser / device type, but a different screen -> different
		// fingerprint, so this can only be a weak match.
		const bId = await makeInstance({ screenW: 1366, screenH: 768 });

		const a = await store.getOrCreateUser(aId);
		const b = await store.getOrCreateUser(bId);
		expect(b.identityId).toBe(a.identityId);
		expect(b.matchConfidence).toBe('weak');
		// Weak matches must NOT inherit shared preferences.
		expect(b.darkMode).toBe(false);
	});

	it('does not couple instances without analytics consent', async () => {
		const u = await store.getOrCreateUser(undefined);
		await store.updateUser(u.id, DESKTOP);
		await store.coupleInstance(u.id);
		const after = await store.getOrCreateUser(u.id);
		expect(after.identityId).toBeNull();
		expect(after.matchConfidence).toBeNull();
	});

	it('unlinks an instance when analytics consent is withdrawn', async () => {
		const aId = await makeInstance();
		const bId = await makeInstance();
		expect((await store.getOrCreateUser(bId)).identityId).not.toBeNull();

		await store.unlinkInstance(bId);
		const b = await store.getOrCreateUser(bId);
		expect(b.identityId).toBeNull();
		expect(b.fingerprintHash).toBeNull();
		expect(b.matchConfidence).toBeNull();

		// The other instance is untouched.
		expect((await store.getOrCreateUser(aId)).identityId).not.toBeNull();
	});
});
