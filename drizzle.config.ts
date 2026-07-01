import { defineConfig } from 'drizzle-kit';

// Load variables from .env when present (e.g. local development). In
// containers the variables are injected directly, so the file may not exist.
try {
	process.loadEnvFile('.env');
} catch {
	console.warn('No .env file found, relying on ambient environment variables');
	// No .env file — rely on the ambient environment.
}

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/spelwijsheid'
	}
});
