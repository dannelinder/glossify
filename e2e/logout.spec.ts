

import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'meeratesta@gmail.com';
const TEST_PASSWORD = 'Sn0b@lls@r3n0tusu@lly$33nInth3Summ3r';

test('user can log out from settings', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.fill('#email', TEST_EMAIL);
  await page.fill('#password', TEST_PASSWORD);
  await page.click('#auth-submit');

  // Go to settings page (button with id 'installningar-btn')
  const settingsBtn = page.locator('#installningar-btn');
  await expect(settingsBtn).toBeVisible({ timeout: 8000 });
  await expect(settingsBtn).toBeEnabled();
  await settingsBtn.click();

  // Click the Sign Out button by test id
  const signOutBtn = page.getByTestId('signout-btn');
  await expect(signOutBtn).toBeVisible();
  await signOutBtn.click();

  // Should return to login screen
  await expect(page.locator('#auth-submit')).toBeVisible();

  // Try to visit a protected route after logout
  await page.goto('http://localhost:3000/practice/weekly');
  // Should be redirected to login screen
  await expect(page.locator('#auth-submit')).toBeVisible();
});
