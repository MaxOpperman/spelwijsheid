import { eq, and, avg, count, sql, ne, desc, isNotNull } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from './db';
import { users, gameStates, gameResults, identities, type User } from './db/schema';
import { CONSENT_VERSION, DATA_RETENTION_DAYS } from './session';
import { computeFingerprint, type FingerprintSignals } from './analytics';

/**
 * Fetch a user by id, or create a fresh one if it does not exist.
 * The id comes from the `uid` cookie.
 */
export async function getOrCreateUser(id: string | undefined): Promise<User> {
	if (id) {
		const existing = await db.select().from(users).where(eq(users.id, id)).limit(1);
		if (existing.length > 0) {
			return existing[0];
		}
	}
	// Either no cookie or the id is unknown — create a new record. Generate the
	// id in app code so both branches insert an explicit value.
	const newId = id ?? randomUUID();
	const inserted = await db.insert(users).values({ id: newId }).onConflictDoNothing().returning();

	if (inserted.length > 0) {
		return inserted[0];
	}
	// Conflict raced with another request; read it back.
	const row = await db.select().from(users).where(eq(users.id, newId)).limit(1);
	return row[0];
}

export async function touchLastSeen(id: string): Promise<void> {
	await db.update(users).set({ lastSeen: new Date() }).where(eq(users.id, id));
}

/** Record an active visit: bumps the counter and the last-active timestamp. */
export async function recordVisit(id: string): Promise<void> {
	await db
		.update(users)
		.set({ visitCount: sql`${users.visitCount} + 1`, lastActiveAt: new Date() })
		.where(eq(users.id, id));
}

export async function updateUser(id: string, patch: Partial<User>): Promise<void> {
	await db.update(users).set(patch).where(eq(users.id, id));
}

export async function setDarkMode(id: string, darkMode: boolean): Promise<void> {
	await db.update(users).set({ darkMode }).where(eq(users.id, id));
	await propagatePrefToIdentity(id, { darkMode });
}

export async function setLocale(id: string, locale: string): Promise<void> {
	await db.update(users).set({ locale }).where(eq(users.id, id));
	await propagatePrefToIdentity(id, { locale });
}

/** Functional preferences that are stored without analytics consent. */
export interface FunctionalPreferences {
	timezone: string;
	reducedMotion: boolean;
	highContrast: boolean;
	soundEnabled: boolean;
	onboardingCompleted: boolean;
}

export async function setFunctionalPreferences(
	id: string,
	prefs: Partial<FunctionalPreferences>
): Promise<void> {
	const patch: Partial<User> = {};
	if (typeof prefs.timezone === 'string') patch.timezone = prefs.timezone;
	if (typeof prefs.reducedMotion === 'boolean') patch.reducedMotion = prefs.reducedMotion;
	if (typeof prefs.highContrast === 'boolean') patch.highContrast = prefs.highContrast;
	if (typeof prefs.soundEnabled === 'boolean') patch.soundEnabled = prefs.soundEnabled;
	if (typeof prefs.onboardingCompleted === 'boolean')
		patch.onboardingCompleted = prefs.onboardingCompleted;
	if (Object.keys(patch).length === 0) return;
	await db.update(users).set(patch).where(eq(users.id, id));

	// Propagate the shared subset (not timezone/onboarding) to the identity.
	const canonical: CanonicalPreferences = {};
	if ('reducedMotion' in patch) canonical.reducedMotion = patch.reducedMotion;
	if ('highContrast' in patch) canonical.highContrast = patch.highContrast;
	if ('soundEnabled' in patch) canonical.soundEnabled = patch.soundEnabled;
	await propagatePrefToIdentity(id, canonical);
}

export async function setConsent(
	id: string,
	consent: { functional: boolean; analytics: boolean }
): Promise<void> {
	const now = new Date();
	const retention = consent.analytics
		? new Date(now.getTime() + DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000)
		: null;
	await db
		.update(users)
		.set({
			consentFunctional: consent.functional,
			consentAnalytics: consent.analytics,
			consentUpdatedAt: now,
			consentVersion: CONSENT_VERSION,
			dataRetentionExpiresAt: retention
		})
		.where(eq(users.id, id));
}

// ---- Cross-instance coupling (heuristic, analytics-gated) -----------------
//
// Multiple `users` rows (different browsers, devices, cookie resets) that look
// like the same person are grouped under a shared `identities` row. Matching is
// best-effort: a strong match means an identical device fingerprint; a weak
// match means the same IP plus matching OS/browser/device type. Shared
// preferences propagate only on strong matches to avoid one person's settings
// bleeding onto another on shared IPs or identical device models.

type CanonicalPreferences = Partial<
	Pick<User, 'darkMode' | 'locale' | 'reducedMotion' | 'highContrast' | 'soundEnabled'>
>;

function fingerprintSignalsOf(u: User): FingerprintSignals {
	return {
		os: u.os,
		osVersion: u.osVersion,
		browser: u.browser,
		browserVersion: u.browserVersion,
		deviceType: u.deviceType,
		deviceVendor: u.deviceVendor,
		deviceModel: u.deviceModel,
		screenW: u.screenW,
		screenH: u.screenH,
		dpr: u.dpr,
		timezone: u.timezone,
		languageHeader: u.languageHeader,
		colorScheme: u.colorScheme
	};
}

/** Recompute and persist the fingerprint hash from a user's stored signals. */
export async function refreshFingerprint(userId: string): Promise<string | null> {
	const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
	if (rows.length === 0) return null;
	const hash = computeFingerprint(fingerprintSignalsOf(rows[0]));
	await db.update(users).set({ fingerprintHash: hash }).where(eq(users.id, userId));
	return hash;
}

/**
 * Recompute the fingerprint for a consented instance and couple it to the
 * best-matching identity (creating one if there is no match). No-op without
 * analytics consent.
 */
export async function coupleInstance(userId: string): Promise<void> {
	const hash = await refreshFingerprint(userId);
	const me = (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0];
	if (!me || !me.consentAnalytics) return;

	let identityId: string | null = null;
	let confidence: 'strong' | 'weak' | null = null;

	// 1. Strong match: another consented instance with the same fingerprint.
	if (hash) {
		const strong = await db
			.select()
			.from(users)
			.where(
				and(eq(users.fingerprintHash, hash), eq(users.consentAnalytics, true), ne(users.id, userId))
			)
			.orderBy(desc(users.lastActiveAt))
			.limit(1);
		if (strong.length > 0) {
			confidence = 'strong';
			identityId = strong[0].identityId;
			if (!identityId) {
				identityId = (await db.insert(identities).values({}).returning())[0].id;
				await db
					.update(users)
					.set({ identityId, matchConfidence: 'strong' })
					.where(eq(users.id, strong[0].id));
			}
		}
	}

	// 2. Weak match: same IP plus matching OS / browser / device type.
	if (!identityId && me.ip) {
		const candidates = await db
			.select()
			.from(users)
			.where(
				and(
					eq(users.ip, me.ip),
					eq(users.consentAnalytics, true),
					ne(users.id, userId),
					isNotNull(users.identityId)
				)
			)
			.orderBy(desc(users.lastActiveAt))
			.limit(20);
		const match = candidates.find(
			(w) =>
				(w.os ?? '') === (me.os ?? '') &&
				(w.browser ?? '') === (me.browser ?? '') &&
				(w.deviceType ?? '') === (me.deviceType ?? '')
		);
		if (match) {
			identityId = match.identityId;
			confidence = 'weak';
		}
	}

	// 3. No match: keep the existing identity, or create a solo one.
	if (!identityId) {
		if (me.identityId) {
			identityId = me.identityId;
			confidence = (me.matchConfidence as 'strong' | 'weak' | null) ?? null;
		} else {
			identityId = (await db.insert(identities).values({}).returning())[0].id;
			confidence = null;
		}
	}

	await db
		.update(users)
		.set({ identityId, matchConfidence: confidence })
		.where(eq(users.id, userId));
	await db
		.update(identities)
		.set({ lastMatchedAt: new Date() })
		.where(eq(identities.id, identityId));

	// On a strong match, sync canonical preferences between the instance and its
	// identity (seed the identity if empty, otherwise adopt the shared prefs).
	if (confidence === 'strong') {
		await applyIdentityPreferences(userId, identityId);
	}
}

/** Break a user out of its identity (e.g. when analytics consent is withdrawn). */
export async function unlinkInstance(userId: string): Promise<void> {
	await db
		.update(users)
		.set({ identityId: null, fingerprintHash: null, matchConfidence: null })
		.where(eq(users.id, userId));
}

/** Write a preference change through to the user's identity, if it has one. */
async function propagatePrefToIdentity(userId: string, patch: CanonicalPreferences): Promise<void> {
	if (Object.keys(patch).length === 0) return;
	const rows = await db
		.select({ identityId: users.identityId })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);
	const identityId = rows[0]?.identityId;
	if (!identityId) return;
	await db
		.update(identities)
		.set({ ...patch, prefsUpdatedAt: new Date() })
		.where(eq(identities.id, identityId));
}

/**
 * Seed an identity's canonical preferences from the user if it has none yet,
 * otherwise apply the identity's shared preferences to the user.
 */
async function applyIdentityPreferences(userId: string, identityId: string): Promise<void> {
	const idn = (await db.select().from(identities).where(eq(identities.id, identityId)).limit(1))[0];
	if (!idn) return;

	if (idn.prefsUpdatedAt == null) {
		const u = (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0];
		if (!u) return;
		await db
			.update(identities)
			.set({
				darkMode: u.darkMode,
				locale: u.locale,
				reducedMotion: u.reducedMotion,
				highContrast: u.highContrast,
				soundEnabled: u.soundEnabled,
				prefsUpdatedAt: new Date()
			})
			.where(eq(identities.id, identityId));
		return;
	}

	const patch: CanonicalPreferences = {};
	if (idn.darkMode != null) patch.darkMode = idn.darkMode;
	if (idn.locale != null) patch.locale = idn.locale;
	if (idn.reducedMotion != null) patch.reducedMotion = idn.reducedMotion;
	if (idn.highContrast != null) patch.highContrast = idn.highContrast;
	if (idn.soundEnabled != null) patch.soundEnabled = idn.soundEnabled;
	if (Object.keys(patch).length > 0) {
		await db.update(users).set(patch).where(eq(users.id, userId));
	}
}

export interface EffectivePreferences {
	darkMode: boolean;
	locale: string | null;
	reducedMotion: boolean;
	highContrast: boolean;
	soundEnabled: boolean;
}

/** Preferences for a user, merging the identity's shared prefs on a strong match. */
export async function getEffectivePreferences(user: User): Promise<EffectivePreferences> {
	const base: EffectivePreferences = {
		darkMode: user.darkMode,
		locale: user.locale,
		reducedMotion: user.reducedMotion,
		highContrast: user.highContrast,
		soundEnabled: user.soundEnabled
	};
	if (user.matchConfidence !== 'strong' || !user.identityId) return base;
	const rows = await db
		.select()
		.from(identities)
		.where(eq(identities.id, user.identityId))
		.limit(1);
	if (rows.length === 0 || rows[0].prefsUpdatedAt == null) return base;
	const idn = rows[0];
	return {
		darkMode: idn.darkMode ?? base.darkMode,
		locale: idn.locale ?? base.locale,
		reducedMotion: idn.reducedMotion ?? base.reducedMotion,
		highContrast: idn.highContrast ?? base.highContrast,
		soundEnabled: idn.soundEnabled ?? base.soundEnabled
	};
}

export async function getGameState<T = unknown>(
	userId: string,
	game: string,
	locale = ''
): Promise<T | null> {
	const rows = await db
		.select()
		.from(gameStates)
		.where(
			and(eq(gameStates.userId, userId), eq(gameStates.game, game), eq(gameStates.locale, locale))
		)
		.limit(1);
	return rows.length > 0 ? (rows[0].state as T) : null;
}

export async function setGameState(
	userId: string,
	game: string,
	state: unknown,
	locale = ''
): Promise<void> {
	await db
		.insert(gameStates)
		.values({ userId, game, locale, state, updatedAt: new Date() })
		.onConflictDoUpdate({
			target: [gameStates.userId, gameStates.game, gameStates.locale],
			set: { state, updatedAt: new Date() }
		});
}

export async function clearGameState(userId: string, game: string, locale = ''): Promise<void> {
	await db
		.delete(gameStates)
		.where(
			and(eq(gameStates.userId, userId), eq(gameStates.game, game), eq(gameStates.locale, locale))
		);
}

// ---- Game results / averages --------------------------------------------

export async function recordGameResult(params: {
	userId: string;
	game: string;
	locale?: string;
	won: boolean;
	durationMs?: number | null;
}): Promise<void> {
	await db.insert(gameResults).values({
		userId: params.userId,
		game: params.game,
		locale: params.locale ?? '',
		won: params.won,
		durationMs: params.durationMs ?? null
	});
	await updateStreak(params.userId);
}

/**
 * Maintain the daily play streak. Playing again on the same day is a no-op;
 * playing on the next calendar day extends the streak; any longer gap resets
 * it. `longestStreak` tracks the all-time best.
 */
async function updateStreak(userId: string): Promise<void> {
	const rows = await db
		.select({
			current: users.currentStreak,
			longest: users.longestStreak,
			last: users.lastStreakDate
		})
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);
	if (rows.length === 0) return;

	const toDateStr = (d: Date) => d.toISOString().slice(0, 10);
	const today = new Date();
	const todayStr = toDateStr(today);
	const last = rows[0].last; // 'YYYY-MM-DD' or null
	if (last === todayStr) return; // already counted today

	const yesterdayStr = toDateStr(new Date(today.getTime() - 24 * 60 * 60 * 1000));
	const current = last === yesterdayStr ? (rows[0].current ?? 0) + 1 : 1;
	const longest = Math.max(rows[0].longest ?? 0, current);
	await db
		.update(users)
		.set({ currentStreak: current, longestStreak: longest, lastStreakDate: todayStr })
		.where(eq(users.id, userId));
}

export interface GameStats {
	gamesPlayed: number;
	gamesWon: number;
	averageTimeMs: number | null;
	bestTimeMs: number | null;
}

/**
 * Aggregate stats for a user/game. Average time is computed over won games
 * that recorded a duration.
 */
export async function getGameStats(
	userId: string,
	game: string,
	locale?: string
): Promise<GameStats> {
	const conditions = [eq(gameResults.userId, userId), eq(gameResults.game, game)];
	if (locale !== undefined) {
		conditions.push(eq(gameResults.locale, locale));
	}
	const rows = await db
		.select({
			gamesPlayed: count(),
			gamesWon: sql<number>`count(*) filter (where ${gameResults.won})`,
			averageTimeMs: avg(
				sql`case when ${gameResults.won} then ${gameResults.durationMs} end`
			).mapWith(Number),
			bestTimeMs: sql<
				number | null
			>`min(${gameResults.durationMs}) filter (where ${gameResults.won})`
		})
		.from(gameResults)
		.where(and(...conditions));

	const r = rows[0];
	return {
		gamesPlayed: Number(r?.gamesPlayed ?? 0),
		gamesWon: Number(r?.gamesWon ?? 0),
		averageTimeMs: r?.averageTimeMs != null ? Number(r.averageTimeMs) : null,
		bestTimeMs: r?.bestTimeMs != null ? Number(r.bestTimeMs) : null
	};
}
