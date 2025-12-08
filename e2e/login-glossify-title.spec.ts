import { test, expect } from '@playwright/test';

const TEST_USER = process.env.TEST_USER || '';
const TEST_PASSWORD = process.env.TEST_PASSWORD || '';

test('login and see Glossify title', async ({ page }) => {
  await page.goto('https://my.epiroc.com/');
  await page.fill('#email', TEST_USER);
  await page.fill('#password', TEST_PASSWORD);
  await page.click('#auth-submit');
  await expect(page.locator('#glossify-title')).toContainText('Glossify');
});