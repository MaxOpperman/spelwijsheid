// Standalone migration runner used at container startup.
// Applies the SQL files in ./drizzle against DATABASE_URL.
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	console.error('DATABASE_URL is not set; cannot run migrations.');
	process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const db = drizzle(pool);

try {
	await migrate(db, { migrationsFolder: './drizzle' });
	console.log('✓ Database migrations applied.');
} catch (err) {
	console.error('Migration failed:', err);
	process.exit(1);
} finally {
	await pool.end();
}
