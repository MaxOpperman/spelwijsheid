import pg from 'pg';
const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
	await c.connect();
	const r = await c.query(
		"select table_name from information_schema.tables where table_schema='public' order by table_name"
	);
	console.log('Tables:', r.rows.map((x) => x.table_name).join(', ') || '(none)');
} catch (e) {
	console.error('DB error:', e.message);
	process.exitCode = 1;
} finally {
	await c.end();
}
