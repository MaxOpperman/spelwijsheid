import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

// Lazily initialise the connection pool so that merely importing this module
// (e.g. during build/prerender) does not require DATABASE_URL or open a
// connection. The pool is created on first actual query.
let _db: NodePgDatabase<typeof schema> | null = null;

function getDb(): NodePgDatabase<typeof schema> {
	if (_db) return _db;
	const connectionString = env.DATABASE_URL;
	if (!connectionString) {
		throw new Error('DATABASE_URL environment variable is not set');
	}
	// Pool size is configurable (defaults to node-postgres' default of 10).
	// Tests against a single-connection server can set DATABASE_POOL_MAX=1.
	const max = env.DATABASE_POOL_MAX ? Number(env.DATABASE_POOL_MAX) : undefined;
	const pool = new pg.Pool({ connectionString, ...(max ? { max } : {}) });
	_db = drizzle(pool, { schema });
	return _db;
}

// Proxy that defers initialisation until a property is accessed.
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
	get(_target, prop, receiver) {
		const real = getDb();
		const value = Reflect.get(real as object, prop, receiver);
		return typeof value === 'function' ? value.bind(real) : value;
	}
});

export { schema };
