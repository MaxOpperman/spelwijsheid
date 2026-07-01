import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import type { PGlite } from '@electric-sql/pglite';
import { createMigratedDb } from './helpers/db';

// Forwarding proxy installed in place of the real `./db` module (see
// user-store.integration.spec.ts for the rationale).
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

const store = await import('../src/lib/server/user');
const consent = await import('../src/routes/api/consent/+server');
const preferences = await import('../src/routes/api/preferences/+server');
const session = await import('../src/routes/api/session/+server');
const device = await import('../src/routes/api/device/+server');
const spelwijze = await import('../src/routes/api/games/spelwijze/+server');
const queens = await import('../src/routes/api/games/queens/+server');

let client: PGlite;

// Minimal RequestEvent stub sufficient for these handlers.
interface EventOpts {
	uid: string;
	user?: unknown;
	body?: unknown;
	url?: string;
	cookieSet?: (name: string, value: string, opts: unknown) => void;
}
function makeEvent(opts: EventOpts) {
	return {
		locals: { uid: opts.uid, user: opts.user },
		request: { json: async () => opts.body },
		url: new URL(opts.url ?? 'http://localhost/'),
		cookies: { set: opts.cookieSet ?? (() => {}), get: () => undefined, delete: () => {} }
	} as never;
}

beforeAll(async () => {
	const created = await createMigratedDb();
	client = created.client;
	setReal(created.db);
});

afterAll(async () => {
	await client.close();
});

beforeEach(async () => {
	await client.exec('TRUNCATE TABLE users CASCADE;');
});

describe('POST /api/consent', () => {
	it('records analytics consent and stamps the decision', async () => {
		const user = await store.getOrCreateUser(undefined);
		const res = await consent.POST(
			makeEvent({ uid: user.id, body: { functional: true, analytics: true } })
		);
		expect(await res.json()).toEqual({ ok: true, functional: true, analytics: true });

		const saved = await store.getOrCreateUser(user.id);
		expect(saved.consentAnalytics).toBe(true);
		expect(saved.consentUpdatedAt).toBeInstanceOf(Date);
	});

	it('treats functional as essential (defaults true) and analytics as opt-in', async () => {
		const user = await store.getOrCreateUser(undefined);
		const res = await consent.POST(makeEvent({ uid: user.id, body: {} }));
		expect(await res.json()).toEqual({ ok: true, functional: true, analytics: false });
	});
});

describe('POST /api/preferences', () => {
	it('persists dark mode and mirrors it to the theme cookie', async () => {
		const user = await store.getOrCreateUser(undefined);
		let cookieArgs: [string, string] | null = null;
		const res = await preferences.POST(
			makeEvent({
				uid: user.id,
				body: { darkMode: true },
				cookieSet: (name, value) => (cookieArgs = [name, value])
			})
		);
		expect(await res.json()).toEqual({ ok: true });
		expect(cookieArgs).toEqual(['theme', 'dark']);
		expect((await store.getOrCreateUser(user.id)).darkMode).toBe(true);
	});

	it('persists locale', async () => {
		const user = await store.getOrCreateUser(undefined);
		await preferences.POST(makeEvent({ uid: user.id, body: { locale: 'nl-NL' } }));
		expect((await store.getOrCreateUser(user.id)).locale).toBe('nl-NL');
	});

	it('persists functional preferences without analytics consent', async () => {
		const user = await store.getOrCreateUser(undefined);
		const res = await preferences.POST(
			makeEvent({
				uid: user.id,
				user,
				body: {
					timezone: 'Europe/Amsterdam',
					reducedMotion: true,
					soundEnabled: false
				}
			})
		);
		expect(await res.json()).toEqual({ ok: true });
		const saved = await store.getOrCreateUser(user.id);
		expect(saved.timezone).toBe('Europe/Amsterdam');
		expect(saved.reducedMotion).toBe(true);
		expect(saved.soundEnabled).toBe(false);
	});
});

describe('GET /api/session', () => {
	it('reflects undecided consent for a fresh user', async () => {
		const user = await store.getOrCreateUser(undefined);
		const res = await session.GET(makeEvent({ uid: user.id, user }));
		expect(await res.json()).toEqual({
			darkMode: false,
			locale: null,
			timezone: null,
			reducedMotion: false,
			highContrast: false,
			soundEnabled: true,
			onboardingCompleted: false,
			consentDecided: false,
			consentFunctional: false,
			consentAnalytics: false
		});
	});

	it('reflects a decided consent state', async () => {
		const user = await store.getOrCreateUser(undefined);
		await store.setConsent(user.id, { functional: true, analytics: true });
		const refreshed = await store.getOrCreateUser(user.id);
		const res = await session.GET(makeEvent({ uid: user.id, user: refreshed }));
		const body = await res.json();
		expect(body.consentDecided).toBe(true);
		expect(body.consentAnalytics).toBe(true);
	});
});

describe('POST /api/device', () => {
	it('rejects screen capture without analytics consent', async () => {
		const user = await store.getOrCreateUser(undefined);
		const res = await device.POST(
			makeEvent({ uid: user.id, user, body: { screenW: 1920, screenH: 1080 } })
		);
		expect(await res.json()).toEqual({ ok: false, reason: 'no-consent' });
		expect((await store.getOrCreateUser(user.id)).screenW).toBeNull();
	});

	it('stores screen and viewport size with analytics consent', async () => {
		const user = await store.getOrCreateUser(undefined);
		await store.setConsent(user.id, { functional: true, analytics: true });
		const consented = await store.getOrCreateUser(user.id);
		const res = await device.POST(
			makeEvent({
				uid: user.id,
				user: consented,
				body: { screenW: 1920, screenH: 1080, viewportW: 1280, viewportH: 720 }
			})
		);
		expect(await res.json()).toEqual({ ok: true });
		const saved = await store.getOrCreateUser(user.id);
		expect(saved.screenW).toBe(1920);
		expect(saved.viewportH).toBe(720);
	});

	it('stores device pixel ratio and colour scheme with analytics consent', async () => {
		const user = await store.getOrCreateUser(undefined);
		await store.setConsent(user.id, { functional: true, analytics: true });
		const consented = await store.getOrCreateUser(user.id);
		const res = await device.POST(
			makeEvent({
				uid: user.id,
				user: consented,
				body: { screenW: 1920, screenH: 1080, dpr: 2, colorScheme: 'dark' }
			})
		);
		expect(await res.json()).toEqual({ ok: true });
		const saved = await store.getOrCreateUser(user.id);
		expect(saved.dpr).toBe(2);
		expect(saved.colorScheme).toBe('dark');
	});

	it('stores hardware and connection signals', async () => {
		const user = await store.getOrCreateUser(undefined);
		await store.setConsent(user.id, { functional: true, analytics: true });
		const consented = await store.getOrCreateUser(user.id);
		const res = await device.POST(
			makeEvent({
				uid: user.id,
				user: consented,
				body: {
					colorDepth: 24,
					pointerCoarse: true,
					hoverNone: false,
					cpuCores: 8,
					deviceMemory: 8,
					connectionType: 'wifi',
					connectionEffectiveType: '4g',
					connectionDownlink: 10.5
				}
			})
		);
		expect(await res.json()).toEqual({ ok: true });
		const saved = await store.getOrCreateUser(user.id);
		expect(saved.colorDepth).toBe(24);
		expect(saved.pointerCoarse).toBe(true);
		expect(saved.hoverNone).toBe(false);
		expect(saved.cpuCores).toBe(8);
		expect(saved.deviceMemory).toBe(8);
		expect(saved.connectionType).toBe('wifi');
		expect(saved.connectionEffectiveType).toBe('4g');
		expect(saved.connectionDownlink).toBe(10.5);
	});

	it('ignores non-boolean values for pointerCoarse and hoverNone', async () => {
		const user = await store.getOrCreateUser(undefined);
		await store.setConsent(user.id, { functional: true, analytics: true });
		const consented = await store.getOrCreateUser(user.id);
		await device.POST(
			makeEvent({
				uid: user.id,
				user: consented,
				body: { pointerCoarse: 'yes', hoverNone: 1 }
			})
		);
		const saved = await store.getOrCreateUser(user.id);
		expect(saved.pointerCoarse).toBeNull();
		expect(saved.hoverNone).toBeNull();
	});
});

describe('/api/games/spelwijze', () => {
	it('round-trips game state keyed by locale', async () => {
		const user = await store.getOrCreateUser(undefined);
		const state = { found: ['kaas'], time: 12 };
		await spelwijze.POST(
			makeEvent({ uid: user.id, url: 'http://localhost/?locale=nl-NL', body: state })
		);
		const res = await spelwijze.GET(
			makeEvent({ uid: user.id, url: 'http://localhost/?locale=nl-NL' })
		);
		expect(await res.json()).toEqual({ state });
	});

	it('rejects a null body with 400', async () => {
		const user = await store.getOrCreateUser(undefined);
		const res = await spelwijze.POST(makeEvent({ uid: user.id, body: null }));
		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ ok: false });
	});
});

describe('/api/games/queens', () => {
	it('saves a game and reads it back with default meta/leaderboard', async () => {
		const user = await store.getOrCreateUser(undefined);
		await queens.POST(makeEvent({ uid: user.id, body: { type: 'save', game: 'BOARD-DATA' } }));
		const res = await queens.GET(makeEvent({ uid: user.id }));
		expect(await res.json()).toEqual({
			game: 'BOARD-DATA',
			meta: { pausedTime: 0, lastCompletionTime: null },
			leaderboard: []
		});
	});

	it('on completion records a timed result and a leaderboard entry', async () => {
		const user = await store.getOrCreateUser(undefined);
		await queens.POST(
			makeEvent({ uid: user.id, body: { type: 'complete', game: 'G', size: 8, time: 42 } })
		);
		const res = await queens.GET(makeEvent({ uid: user.id }));
		const body = await res.json();
		expect(body.leaderboard).toHaveLength(1);
		expect(body.leaderboard[0]).toMatchObject({ size: 8, time: 42 });
		expect(body.meta.lastCompletionTime).toBe(42);

		// recordGameResult stored time*1000 ms, scoped by size as locale.
		const stats = await store.getGameStats(user.id, 'queens', '8');
		expect(stats.gamesPlayed).toBe(1);
		expect(stats.bestTimeMs).toBe(42000);
	});
});
