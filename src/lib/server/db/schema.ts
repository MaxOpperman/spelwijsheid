import {
	pgTable,
	uuid,
	text,
	boolean,
	integer,
	real,
	date,
	timestamp,
	jsonb,
	primaryKey,
	index
} from 'drizzle-orm/pg-core';

/**
 * A person, potentially spanning several `users` instances (browsers, devices,
 * cookie resets) that were heuristically coupled. Holds canonical shared
 * preferences that propagate to strong-match members. Only created/maintained
 * with analytics consent.
 */
export const identities = pgTable('identities', {
	id: uuid('id').primaryKey().defaultRandom(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	lastMatchedAt: timestamp('last_matched_at', { withTimezone: true }).notNull().defaultNow(),

	// Canonical shared preferences (null until a member sets them).
	darkMode: boolean('dark_mode'),
	locale: text('locale'),
	reducedMotion: boolean('reduced_motion'),
	highContrast: boolean('high_contrast'),
	soundEnabled: boolean('sound_enabled'),
	prefsUpdatedAt: timestamp('prefs_updated_at', { withTimezone: true })
});

/**
 * One row per visitor, keyed by the UUID stored in the `uid` cookie.
 *
 * Functional fields (dark_mode, consent flags) are always stored. Analytics
 * fields (ip, location, browser, os, screen size) are only populated once the
 * user has granted analytics consent.
 */
export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	lastSeen: timestamp('last_seen', { withTimezone: true }).notNull().defaultNow(),

	// Functional preferences (essential — stored without analytics consent)
	darkMode: boolean('dark_mode').notNull().default(false),
	locale: text('locale'),
	timezone: text('timezone'),
	reducedMotion: boolean('reduced_motion').notNull().default(false),
	highContrast: boolean('high_contrast').notNull().default(false),
	soundEnabled: boolean('sound_enabled').notNull().default(true),
	onboardingCompleted: boolean('onboarding_completed').notNull().default(false),

	// Consent state
	consentFunctional: boolean('consent_functional').notNull().default(false),
	consentAnalytics: boolean('consent_analytics').notNull().default(false),
	consentUpdatedAt: timestamp('consent_updated_at', { withTimezone: true }),
	consentVersion: text('consent_version'),

	// Data-lifecycle / compliance
	deletedAt: timestamp('deleted_at', { withTimezone: true }),
	dataRetentionExpiresAt: timestamp('data_retention_expires_at', { withTimezone: true }),

	// Engagement / behavioral (only stored with analytics consent)
	visitCount: integer('visit_count').notNull().default(0),
	lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
	currentStreak: integer('current_streak').notNull().default(0),
	longestStreak: integer('longest_streak').notNull().default(0),
	lastStreakDate: date('last_streak_date'),
	referrer: text('referrer'),

	// Analytics (only stored with analytics consent)
	ip: text('ip'),
	country: text('country'),
	region: text('region'),
	city: text('city'),
	browser: text('browser'),
	browserVersion: text('browser_version'),
	os: text('os'),
	osVersion: text('os_version'),
	deviceType: text('device_type'),
	deviceVendor: text('device_vendor'),
	deviceModel: text('device_model'),
	dpr: real('dpr'),
	languageHeader: text('language_header'),
	colorScheme: text('color_scheme'),
	screenW: integer('screen_w'),
	screenH: integer('screen_h'),
	viewportW: integer('viewport_w'),
	viewportH: integer('viewport_h'),

	// Cross-instance coupling (heuristic, analytics-gated)
	identityId: uuid('identity_id').references(() => identities.id, { onDelete: 'set null' }),
	fingerprintHash: text('fingerprint_hash'),
	matchConfidence: text('match_confidence')
});

/**
 * Persisted per-game state, replacing the old per-game cookies / localStorage.
 * Keyed by (user, game, locale) so a user keeps independent progress per locale.
 */
export const gameStates = pgTable(
	'game_states',
	{
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		game: text('game').notNull(),
		locale: text('locale').notNull().default(''),
		state: jsonb('state').notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [primaryKey({ columns: [table.userId, table.game, table.locale] })]
);

/**
 * One row per finished game. Source of truth for average game times and stats.
 */
export const gameResults = pgTable(
	'game_results',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		game: text('game').notNull(),
		locale: text('locale').notNull().default(''),
		won: boolean('won').notNull(),
		durationMs: integer('duration_ms'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [index('game_results_user_game_idx').on(table.userId, table.game, table.locale)]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Identity = typeof identities.$inferSelect;
export type NewIdentity = typeof identities.$inferInsert;
export type GameStateRow = typeof gameStates.$inferSelect;
export type GameResultRow = typeof gameResults.$inferSelect;
