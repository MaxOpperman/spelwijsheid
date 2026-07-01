import { test, expect } from '@playwright/test';

test.describe('Dark mode', () => {
	test('toggles and persists the theme across a reload', async ({ page }) => {
		await page.goto('/');
		// The consent banner only renders after the client hydrates (onMount),
		// so waiting for it guarantees the toggle's click handler is attached.
		await expect(page.getByRole('dialog')).toBeVisible();

		const html = page.locator('html');
		const startedDark = await html.evaluate((el) => el.classList.contains('dark'));

		await page.getByRole('button', { name: 'Toggle dark mode' }).click();

		if (startedDark) {
			await expect(html).not.toHaveClass(/\bdark\b/);
		} else {
			await expect(html).toHaveClass(/\bdark\b/);
		}

		// Wait until the preference is persisted server-side before reloading,
		// otherwise hooks.server.ts would re-emit the theme cookie from the
		// stale (pre-toggle) database value.
		await page.waitForResponse(
			(r) => r.url().includes('/api/preferences') && r.request().method() === 'POST'
		);

		// The theme cookie is written client-side; reload should preserve it
		// (applied pre-paint by the inline script in app.html).
		await page.reload();
		if (startedDark) {
			await expect(html).not.toHaveClass(/\bdark\b/);
		} else {
			await expect(html).toHaveClass(/\bdark\b/);
		}
	});
});
