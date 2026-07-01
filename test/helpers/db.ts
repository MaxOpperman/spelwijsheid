import { readdirSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join } from 'path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';

const MIGRATIONS_DIR = fileURLToPath(new URL('../../drizzle', import.meta.url));

/** Concatenate every generated migration SQL file, in order. */
function allMigrationsSql(): string {
	return readdirSync(MIGRATIONS_DIR)
		.filter((f) => f.endsWith('.sql'))
		.sort()
		.map((f) => readFileSync(join(MIGRATIONS_DIR, f), 'utf-8'))
		.join('\n')
		.replaceAll('--> statement-breakpoint', '');
}

/**
 * Spin up an in-process PGlite (real Postgres via WASM, no Docker) and apply
 * the project's migration SQL. Returns the raw client and a Drizzle instance.
 */
export async function createMigratedDb() {
	const client = new PGlite();
	const db = drizzle(client);
	await client.exec(allMigrationsSql());
	return { client, db };
}
