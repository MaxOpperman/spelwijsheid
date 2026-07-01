import { defineConfig, devices } from '@playwright/test';

const DB_PORT = 5433;
const APP_PORT = 4173;
const DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:${DB_PORT}/postgres`;

export default defineConfig({
	testDir: './test-e2e',
	testMatch: '**/*.spec.ts',
	fullyParallel: false,
	workers: 1,
	reporter: 'list',
	use: {
		baseURL: `http://localhost:${APP_PORT}`,
		trace: 'retain-on-failure'
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: [
		{
			command: 'node test-e2e/db-server.mjs',
			port: DB_PORT,
			reuseExistingServer: false,
			timeout: 60_000,
			env: { E2E_DB_PORT: String(DB_PORT) }
		},
		{
			command: `npm run dev -- --port ${APP_PORT} --strictPort`,
			url: `http://localhost:${APP_PORT}`,
			reuseExistingServer: !process.env.CI,
			timeout: 120_000,
			env: { DATABASE_URL, DATABASE_POOL_MAX: '1', NODE_ENV: 'development' }
		}
	]
});
