import { test, expect } from '@playwright/test';

// Each test gets a fresh browser context (no cookies) → a brand-new user, so
// the consent banner should appear until a choice is persisted server-side.
test.describe('Cookie consent', () => {
	test('shows the consent banner to a new visitor', async ({ page }) => {
		await page.goto('/');
		const banner = page.getByRole('dialog', { name: /your data|gegevens|cookies/i });
		await expect(banner).toBeVisible();
		await expect(banner.getByRole('button', { name: 'Essential only' })).toBeVisible();
		await expect(banner.getByRole('button', { name: 'Accept all' })).toBeVisible();
	});

	test('remembers the choice across a reload (persisted server-side)', async ({ page }) => {
		await page.goto('/');
		const banner = page.getByRole('dialog', { name: /your data|gegevens|cookies/i });
		await banner.getByRole('button', { name: 'Essential only' }).click();
		await expect(banner).toBeHidden();

		// Wait for the consent POST to be persisted before reloading.
		await page.waitForResponse(
			(r) => r.url().includes('/api/consent') && r.request().method() === 'POST'
		);
		await page.reload();

		// The /api/session bootstrap should report the decision → no banner.
		await expect(page.getByRole('dialog', { name: /your data|gegevens|cookies/i })).toBeHidden();
	});
});
