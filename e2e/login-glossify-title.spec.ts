import { test, expect } from '@playwright/test';

const TEST_USER = process.env.TEST_USER || '';
const TEST_PASSWORD = process.env.TEST_PASSWORD || '';

test('login and see Glossify title', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.fill('input[type="email"]', TEST_USER);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await expect(page.locator('h1')).toContainText('Glossify');
});