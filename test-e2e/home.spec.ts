import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
	test('loads and shows the primary navigation', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveTitle(/Home/i);

		const nav = page.locator('nav').first();
		await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible();
		await expect(nav.getByRole('button', { name: /Games/i })).toBeVisible();
		await expect(nav.getByRole('button', { name: /Solvers/i })).toBeVisible();
		await expect(nav.getByRole('link', { name: 'About' })).toBeVisible();
	});

	test('can navigate to the About page', async ({ page }) => {
		await page.goto('/');
		await page.locator('nav').first().getByRole('link', { name: 'About' }).click();
		await expect(page).toHaveURL(/\/about\/?$/);
		await expect(page.getByRole('heading', { name: /About the Spelwijsheid app/i })).toBeVisible();
	});
});
