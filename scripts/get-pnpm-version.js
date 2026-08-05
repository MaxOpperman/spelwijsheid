import { readFileSync } from 'fs';
try {
	const pkgPath = new URL('../package.json', import.meta.url);
	const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
	const pm = pkg.packageManager;
	if (!pm) {
		console.error('packageManager not found in package.json');
		process.exit(1);
	}
	const parts = pm.split('@');
	if (parts.length < 2 || !parts[1]) {
		console.error(
			'packageManager in package.json does not contain a version (expected "pnpm@<version>")'
		);
		process.exit(1);
	}
	console.log(parts[1]);
} catch (e) {
	console.error('failed to read package.json:', e.message);
	process.exit(1);
}
