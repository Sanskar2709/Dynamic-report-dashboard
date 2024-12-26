import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('button:has-text("Upload CSV Files")', { timeout: 10000 });
    });

    test('should load main folders and components', async ({ page }) => {
        await expect(page.getByRole('button', { name: /Upload CSV Files/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Manage Tags/i })).toBeVisible();
        await expect(page.getByText('muku')).toBeVisible();
        await expect(page.getByText('sans')).toBeVisible();
    });

    test('should navigate through folder structure', async ({ page }) => {
        await page.getByText('muku').click();
        await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
        await page.getByRole('button', { name: 'Back' }).click();
        await expect(page.getByText('muku')).toBeVisible();
    });

    test('should group files by tags and dates', async ({ page }) => {
        await page.getByText('muku').click();

        const groupDropdown = page.getByRole('combobox').first();
        await groupDropdown.waitFor();

        await groupDropdown.selectOption('tags');
        await expect(page.getByText(/Untagged Files/i)).toBeVisible();

        await groupDropdown.selectOption('date');
        await expect(page.getByText(/\d{1,2} \w+ \d{4}/)).toBeVisible();
    });

    const viewports = [
        { width: 375, height: 667 },
        { width: 768, height: 1024 },
        { width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
        test(`should adapt to ${viewport.width}x${viewport.height} viewport`, async ({ page }) => {
            await page.setViewportSize(viewport);
            await expect(page.getByRole('button', { name: /Upload CSV Files/i })).toBeVisible();
            await expect(page.getByRole('button', { name: /Manage Tags/i })).toBeVisible();
            await expect(page.locator('.grid')).toBeVisible();
        });
    }

    test('should handle folder navigation efficiently', async ({ page }) => {
        const mukuButton = page.getByText('muku');
        await mukuButton.click();
        await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
        await page.getByRole('button', { name: 'Back' }).click();
        await expect(mukuButton).toBeVisible();
    });
});