import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';

export default defineConfig({
	resolve: {
		alias: {
			$lib: fileURLToPath(new URL('./src/lib', import.meta.url))
		}
	},
	test: {
		environment: 'node',
		globals: true,
		include: ['test/**/*.spec.ts']
	}
});
