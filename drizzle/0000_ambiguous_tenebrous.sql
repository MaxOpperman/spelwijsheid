CREATE TABLE "game_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"game" text NOT NULL,
	"locale" text DEFAULT '' NOT NULL,
	"won" boolean NOT NULL,
	"duration_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_states" (
	"user_id" uuid NOT NULL,
	"game" text NOT NULL,
	"locale" text DEFAULT '' NOT NULL,
	"state" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "game_states_user_id_game_locale_pk" PRIMARY KEY("user_id","game","locale")
);
--> statement-breakpoint
CREATE TABLE "identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_matched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"dark_mode" boolean,
	"locale" text,
	"reduced_motion" boolean,
	"high_contrast" boolean,
	"sound_enabled" boolean,
	"prefs_updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen" timestamp with time zone DEFAULT now() NOT NULL,
	"dark_mode" boolean DEFAULT false NOT NULL,
	"locale" text,
	"timezone" text,
	"reduced_motion" boolean DEFAULT false NOT NULL,
	"high_contrast" boolean DEFAULT false NOT NULL,
	"sound_enabled" boolean DEFAULT true NOT NULL,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"consent_functional" boolean DEFAULT false NOT NULL,
	"consent_analytics" boolean DEFAULT false NOT NULL,
	"consent_updated_at" timestamp with time zone,
	"consent_version" text,
	"deleted_at" timestamp with time zone,
	"data_retention_expires_at" timestamp with time zone,
	"visit_count" integer DEFAULT 0 NOT NULL,
	"last_active_at" timestamp with time zone,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_streak_date" date,
	"referrer" text,
	"ip" text,
	"country" text,
	"region" text,
	"city" text,
	"browser" text,
	"browser_version" text,
	"os" text,
	"os_version" text,
	"device_type" text,
	"device_vendor" text,
	"device_model" text,
	"dpr" real,
	"language_header" text,
	"color_scheme" text,
	"screen_w" integer,
	"screen_h" integer,
	"viewport_w" integer,
	"viewport_h" integer,
	"identity_id" uuid,
	"fingerprint_hash" text,
	"match_confidence" text
);
--> statement-breakpoint
ALTER TABLE "game_results" ADD CONSTRAINT "game_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_states" ADD CONSTRAINT "game_states_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_identity_id_identities_id_fk" FOREIGN KEY ("identity_id") REFERENCES "public"."identities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "game_results_user_game_idx" ON "game_results" USING btree ("user_id","game","locale");