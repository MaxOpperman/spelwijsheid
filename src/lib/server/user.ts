import { eq, and, avg, count, sql, ne, desc, isNull, or, gte } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from './db';
import { users, gameStates, gameResults, identities, type User } from './db/schema';
import { CONSENT_VERSION, DATA_RETENTION_DAYS } from './session';
import { computeFingerprint, type FingerprintSignals } from './analytics';

/** Canonical UUID shape, so a tampered cookie never reaches Postgres as a `uuid`. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Fetch a user by id, or create a fresh one if it does not exist.
 * The id comes from the `uid` cookie.
 */
export async function getOrCreateUser(id: string | undefined): Promise<User> {
	// Ignore missing or malformed cookie values: querying/inserting a non-UUID
	// against the `uuid` column would make Postgres throw and 500 the request.
	const validId = id && UUID_RE.test(id) ? id : undefined;
	if (validId) {
		const existing = await db.select().from(users).where(eq(users.id, validId)).limit(1);
		if (existing.length > 0) {
			return existing[0];
		}
	}
	// Either no cookie or the id is unknown/invalid — create a new record.
	// Generate the id in app code so both branches insert an explicit value.
	const newId = validId ?? randomUUID();
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
// like the same person are grouped under a shared `identities` row.
//
// Matching uses a weighted similarity score over all available signals.
// Missing signals on either side are excluded from both numerator and
// denominator so they never penalise a session that has not yet sent all data.
// A time-proximity bonus rewards sessions that are active at the same time,
// since that raises the probability of being the same person on different
// devices or a recent cookie reset.
//
// Candidates are fetched by fingerprint hash or IP to keep the pool
// small. The best-scoring candidate wins.
//
// Thresholds:  ≥ 0.90 → strong (preferences propagate)
//              ≥ 0.50 → weak   (grouped but no pref sync)

type CanonicalPreferences = Partial<
	Pick<User, 'darkMode' | 'locale' | 'reducedMotion' | 'highContrast' | 'soundEnabled'>
>;

/** Relative weights for each similarity signal. */
const SIGNAL_WEIGHTS = {
	// OS / browser — stable, highly identifying
	os: 10,
	browser: 9,
	deviceType: 7,
	deviceModel: 6,
	deviceVendor: 5,
	// Hardware — stable, device-specific
	cpuArch: 8,
	cpuCores: 8,
	deviceMemory: 7,
	screenW: 5,
	screenH: 4,
	dpr: 5,
	colorDepth: 4,
	pointerCoarse: 5,
	hoverNone: 4,
	// User context — stable
	timezone: 8,
	languageHeader: 6,
	colorScheme: 4,
	// Network — variable but informative
	ip: 8
} as const;

const STRONG_THRESHOLD = 0.9;
const WEAK_THRESHOLD = 0.5;
/** Candidate pool: sessions active within this many days. */
const CANDIDATE_WINDOW_DAYS = 90;
/** Maximum candidates to score per call. */
const CANDIDATE_LIMIT = 50;

/**
 * Additive time-proximity bonus. Sessions active at nearly the same time are
 * more likely to belong to the same person (different devices, recent reset).
 */
function timeProximityBonus(a: Date | string | null, b: Date | string | null): number {
	if (!a || !b) return 0;
	const deltaMinutes = Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 60_000;
	if (deltaMinutes <= 30) return 0.08;
	if (deltaMinutes <= 120) return 0.04;
	if (deltaMinutes <= 480) return 0.01;
	return 0;
}

/**
 * Weighted similarity score [0, 1] between two user records.
 * Signals null on either side are skipped so missing data never penalises.
 */
function scoreSimilarity(me: User, other: User): number {
	let matched = 0;
	let total = 0;

	function sig<T>(weight: number, a: T | null | undefined, b: T | null | undefined): void {
		if (a == null || b == null) return;
		total += weight;
		if (a === b) matched += weight;
	}

	sig(SIGNAL_WEIGHTS.os, me.os, other.os);
	sig(SIGNAL_WEIGHTS.browser, me.browser, other.browser);
	sig(SIGNAL_WEIGHTS.deviceType, me.deviceType, other.deviceType);
	sig(SIGNAL_WEIGHTS.deviceModel, me.deviceModel, other.deviceModel);
	sig(SIGNAL_WEIGHTS.deviceVendor, me.deviceVendor, other.deviceVendor);
	sig(SIGNAL_WEIGHTS.cpuArch, me.cpuArch, other.cpuArch);
	sig(SIGNAL_WEIGHTS.cpuCores, me.cpuCores, other.cpuCores);
	sig(SIGNAL_WEIGHTS.deviceMemory, me.deviceMemory, other.deviceMemory);
	sig(SIGNAL_WEIGHTS.screenW, me.screenW, other.screenW);
	sig(SIGNAL_WEIGHTS.screenH, me.screenH, other.screenH);
	sig(SIGNAL_WEIGHTS.dpr, me.dpr, other.dpr);
	sig(SIGNAL_WEIGHTS.colorDepth, me.colorDepth, other.colorDepth);
	sig(SIGNAL_WEIGHTS.pointerCoarse, me.pointerCoarse, other.pointerCoarse);
	sig(SIGNAL_WEIGHTS.hoverNone, me.hoverNone, other.hoverNone);
	sig(SIGNAL_WEIGHTS.timezone, me.timezone, other.timezone);
	sig(SIGNAL_WEIGHTS.colorScheme, me.colorScheme, other.colorScheme);
	sig(SIGNAL_WEIGHTS.ip, me.ip, other.ip);

	// Language: compare only the primary locale tag (case-insensitive).
	const myLang = (me.languageHeader ?? '').split(',')[0]?.trim().toLowerCase();
	const otherLang = (other.languageHeader ?? '').split(',')[0]?.trim().toLowerCase();
	if (myLang && otherLang) {
		total += SIGNAL_WEIGHTS.languageHeader;
		if (myLang === otherLang) matched += SIGNAL_WEIGHTS.languageHeader;
	}

	if (total === 0) return 0;

	return Math.min(1, matched / total + timeProximityBonus(me.lastActiveAt, other.lastActiveAt));
}

function fingerprintSignalsOf(u: User): FingerprintSignals {
	return {
		os: u.os,
		osVersion: u.osVersion,
		browser: u.browser,
		browserVersion: u.browserVersion,
		deviceType: u.deviceType,
		deviceVendor: u.deviceVendor,
		deviceModel: u.deviceModel,
		cpuArch: u.cpuArch,
		cpuCores: u.cpuCores,
		deviceMemory: u.deviceMemory,
		screenW: u.screenW,
		screenH: u.screenH,
		dpr: u.dpr,
		colorDepth: u.colorDepth,
		pointerCoarse: u.pointerCoarse,
		hoverNone: u.hoverNone,
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
 * best-matching identity using score-based similarity. No-op without consent.
 */
export async function coupleInstance(userId: string): Promise<void> {
	const hash = await refreshFingerprint(userId);
	const me = (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0];
	if (!me || !me.consentAnalytics) return;

	// Candidate pool: sessions that share a fingerprint hash or IP and
	// were active within the lookback window. Bounded to keep scoring fast.
	const windowStart = new Date(Date.now() - CANDIDATE_WINDOW_DAYS * 86_400_000);
	const candidates = await db
		.select()
		.from(users)
		.where(
			and(
				ne(users.id, userId),
				eq(users.consentAnalytics, true),
				isNull(users.deletedAt),
				gte(users.lastActiveAt, windowStart),
				or(
					hash ? eq(users.fingerprintHash, hash) : sql`false`,
					me.ip ? eq(users.ip, me.ip) : sql`false`
				)
			)
		)
		.orderBy(desc(users.lastActiveAt))
		.limit(CANDIDATE_LIMIT);

	// Score every candidate and pick the best.
	let bestScore = 0;
	let bestCandidate: User | null = null;
	for (const candidate of candidates) {
		const score = scoreSimilarity(me, candidate);
		if (score > bestScore) {
			bestScore = score;
			bestCandidate = candidate;
		}
	}

	let identityId: string | null = null;
	let confidence: 'strong' | 'weak' | null = null;

	if (bestScore >= STRONG_THRESHOLD && bestCandidate) {
		confidence = 'strong';
		identityId = bestCandidate.identityId;
		if (!identityId) {
			identityId = (await db.insert(identities).values({}).returning())[0].id;
			await db
				.update(users)
				.set({ identityId, matchConfidence: 'strong' })
				.where(eq(users.id, bestCandidate.id));
		}
	} else if (bestScore >= WEAK_THRESHOLD && bestCandidate) {
		confidence = 'weak';
		identityId = bestCandidate.identityId;
		if (!identityId) {
			identityId = (await db.insert(identities).values({}).returning())[0].id;
			await db
				.update(users)
				.set({ identityId, matchConfidence: 'weak' })
				.where(eq(users.id, bestCandidate.id));
		}
	}

	// No match: retain existing identity or open a solo one.
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

	// On a strong match, sync canonical preferences between the instance and
	// its identity (seed identity if empty, otherwise adopt shared prefs).
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
