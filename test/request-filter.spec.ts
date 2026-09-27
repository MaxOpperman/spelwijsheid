import { describe, expect, it } from 'vitest';
import { isScannerPath } from '../src/lib/server/request-filter';

describe('isScannerPath', () => {
	it.each([
		'/.git/config',
		'/.git-credentials',
		'/.env.production',
		'/%2eenv%2eproduction',
		'/.aws/credentials',
		'/.aws-credentials',
		'/terraform.tfstate',
		'/api/secrets.yml',
		'/wp-content/plugins/example.php',
		'/admin/phpinfo.php',
		'/phpinfo',
		'\\wp-content\\plugins\\example.php'
	])('identifies scanner path %s', (pathname) => {
		expect(isScannerPath(pathname)).toBe(true);
	});

	it.each(['/', '/about', '/api/consent', '/wordle', '/spelwijze-solver'])(
		'allows app path %s',
		(pathname) => {
			expect(isScannerPath(pathname)).toBe(false);
		}
	);
});
