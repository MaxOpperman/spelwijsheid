import { test, expect } from '@playwright/test';

test.describe('Global components', () => {
	test('renders the shared header on every primary page', async ({ page }) => {
		for (const path of ['/', '/about', '/wordle', '/queens']) {
			await page.goto(path);
			await expect(page.locator('header')).toBeVisible();
			await expect(page.getByRole('button', { name: 'Toggle dark mode' })).toBeVisible();
			await expect(page.getByRole('button', { name: /Select language/i })).toBeVisible();
		}
	});

	test('opens and closes the language menu', async ({ page }) => {
		await page.goto('/');

		const languageButton = page.getByRole('button', { name: /Select language/i });
		await languageButton.click();

		const languageMenu = page.getByRole('menu', { name: /Select language/i });
		await expect(languageMenu).toBeVisible();
		await expect(languageMenu.getByRole('menuitemradio')).toHaveCount(3);

		await page.keyboard.press('Escape');
		await expect(languageMenu).not.toBeVisible();
	});

	test('toggles the games submenu and closes it after navigation', async ({ page }) => {
		await page.goto('/');

		const gamesButton = page.getByRole('button', { name: /Games/i });
		await gamesButton.click();
		await expect(gamesButton).toHaveAttribute('aria-expanded', 'true');
		await expect(page.getByRole('link', { name: 'Wordle', exact: true })).toBeVisible();

		await page.getByRole('link', { name: 'Wordle', exact: true }).click();
		await expect(page).toHaveURL(/\/wordle\/?$/);
		await expect(gamesButton).toHaveAttribute('aria-expanded', 'false');
	});

	test('dismisses the consent banner through the essential-only action', async ({ page }) => {
		await page.goto('/');

		const banner = page.getByRole('dialog');
		await expect(banner).toBeVisible();
		await banner.getByRole('button', { name: /essential/i }).click();
		await expect(banner).not.toBeVisible();
	});
});
