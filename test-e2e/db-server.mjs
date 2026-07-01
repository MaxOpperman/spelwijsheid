// Standalone test database for E2E: a real Postgres (PGlite/WASM) exposed over
// a TCP socket so the SvelteKit dev server can connect via DATABASE_URL — no
// Docker required. Started by Playwright's webServer config.
import { readdirSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join } from 'path';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';

const PORT = Number(process.env.E2E_DB_PORT ?? 5433);
const MIGRATIONS_DIR = fileURLToPath(new URL('../drizzle', import.meta.url));

const db = await PGlite.create();
const sql = readdirSync(MIGRATIONS_DIR)
	.filter((f) => f.endsWith('.sql'))
	.sort()
	.map((f) => readFileSync(join(MIGRATIONS_DIR, f), 'utf-8'))
	.join('\n')
	.replaceAll('--> statement-breakpoint', '');
await db.exec(sql);

const server = new PGLiteSocketServer({ db, port: PORT, host: '127.0.0.1' });
await server.start();
console.log(`PGlite socket server ready on 127.0.0.1:${PORT}`);

async function shutdown() {
	await server.stop();
	await db.close();
	process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
