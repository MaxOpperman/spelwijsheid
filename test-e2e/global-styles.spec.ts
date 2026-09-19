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

		const viewportHeight = page.viewportSize()?.height ?? 720;

		expect(styles.fontFamily).toContain('Arial');
		expect(styles.bodyMinHeight).toBe(`${viewportHeight}px`);
		expect(styles.mainMaxWidth).toBe('1024px');
		expect(parseFloat(styles.headingFontSize)).toBeGreaterThanOrEqual(32);
		expect(styles.primaryColor).toBe('#2563eb');
	});

	test('updates global colors when dark mode is enabled', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('dialog')).toBeVisible();

		const initialColor = await page.evaluate(() =>
			getComputedStyle(document.documentElement).getPropertyValue('--color-bg-0').trim()
		);
		await page.locator('.dark-mode-toggle').click();

		await expect
			.poll(() => page.locator('html').evaluate((el) => el.classList.contains('dark')))
			.toBe(true);
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
		await page.locator('.mobile-menu-toggle').click();
		await expect
			.poll(async () => {
				const expanded = await menuButton.getAttribute('aria-expanded');
				const navClass = await page.locator('nav').getAttribute('class');
				return expanded === 'true' && Boolean(navClass?.includes('mobile-open'));
			})
			.toBeTruthy();
	});
});
