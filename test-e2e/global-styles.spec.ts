import { test, expect } from '@playwright/test';

test.describe('Global styles', () => {
	test('applies the global layout and typography contract', async ({ page }) => {
		await page.goto('/');

		const styles = await page.evaluate(() => {
			const root = getComputedStyle(document.documentElement);
			const body = getComputedStyle(document.body);
			const main = getComputedStyle(document.querySelector('main')!);
			const heading = getComputedStyle(document.querySelector('h1')!);

			return {
				fontFamily: root.fontFamily,
				bodyMinHeight: body.minHeight,
				mainMaxWidth: main.maxWidth,
				headingFontSize: heading.fontSize,
				primaryColor: root.getPropertyValue('--color-primary').trim()
			};
		});

		expect(styles.fontFamily).toContain('Arial');
		expect(styles.bodyMinHeight).toBe('100vh');
		expect(styles.mainMaxWidth).toBe('1024px');
		expect(styles.headingFontSize).toBe('32px');
		expect(styles.primaryColor).toBe('#2563eb');
	});

	test('updates global colors when dark mode is enabled', async ({ page }) => {
		await page.goto('/');

		const initialColor = await page.evaluate(() =>
			getComputedStyle(document.documentElement).getPropertyValue('--color-bg-0').trim()
		);
		await page.getByRole('button', { name: 'Toggle dark mode' }).click();

		await expect(page.locator('html')).toHaveClass(/\bdark\b/);
		await expect
			.poll(() =>
				page.evaluate(() =>
					getComputedStyle(document.documentElement).getPropertyValue('--color-bg-0').trim()
				)
			)
			.not.toBe(initialColor);
	});

	test('switches the shared header to its mobile layout', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/');

		const menuButton = page.getByRole('button', { name: 'Toggle menu' });
		await expect(menuButton).toBeVisible();
		await menuButton.click();
		await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
		await expect(page.locator('nav')).toHaveClass(/mobile-open/);
	});
});
