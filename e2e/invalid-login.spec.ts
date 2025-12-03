import { test, expect } from '@playwright/test';

test('shows error on invalid login', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.fill('input[type="email"]', 'invalid@example.com');
  await page.fill('input[type="password"]', 'wrongpassword');
  await page.click('button[type="submit"]');
  // Check for the actual error message
  await expect(page.locator('text=Invalid login credentials')).toBeVisible();
});
