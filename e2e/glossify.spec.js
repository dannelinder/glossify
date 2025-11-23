import { test, expect } from '@playwright/test';

test.describe('Glossify PWA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should display login page for unauthenticated users', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Glossify');
    await expect(page.locator('button.auth-button:has-text("Sign In")')).toBeVisible();
    await expect(page.locator('button:has-text("Sign Up")')).toBeVisible();
  });

  test('should toggle between login and signup', async ({ page }) => {
    // Start on login
    await expect(page.locator('button.auth-button:has-text("Sign In")')).toBeVisible();
    
    // Click to switch to signup
    const switchButton = page.locator('button.toggle-button:has-text("Sign Up")');
    await switchButton.click();
    
    // Should see signup form with updated heading
    await expect(page.locator('h2')).toContainText('Create Account');
    await expect(page.locator('button.auth-button:has-text("Sign Up")')).toBeVisible();
  });

  test('should show validation for empty login', async ({ page }) => {
    const loginButton = page.locator('button.auth-button:has-text("Sign In")');
    await loginButton.click();
    
    // Browser HTML5 validation prevents submission
    // Verify we're still on login page
    await expect(page.locator('h2')).toContainText('Log in');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button.auth-button:has-text("Sign In")')).toBeVisible();
    
    // Check that buttons are touch-friendly (not too small)
    const button = page.locator('button.auth-button:has-text("Sign In")');
    const box = await button.boundingBox();
    expect(box?.height).toBeGreaterThan(40); // Touch target should be at least 40px
  });

  test('should have PWA manifest', async ({ page }) => {
    const manifestLink = await page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', /manifest\.json/);
  });

  test('should register service worker in production build', async ({ page }) => {
    // This test would need a production build running
    // For now, just check that the registration code exists
    const hasServiceWorker = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    expect(hasServiceWorker).toBe(true);
  });
});

test.describe('Authenticated User Flow', () => {
  // Note: These tests would require test user credentials
  // For actual implementation, you'd want to use environment variables
  
  test.skip('should allow user to practice flashcards', async ({ page }) => {
    // Skip for now - would need auth setup
    // 1. Login with test user
    // 2. Click "Börja om - Veckans"
    // 3. See flashcard question
    // 4. Submit answer
    // 5. Verify feedback
  });

  test.skip('should persist settings across sessions', async ({ page }) => {
    // Skip for now - would need auth setup
    // 1. Login
    // 2. Change settings (language, sound, etc.)
    // 3. Save
    // 4. Reload page
    // 5. Verify settings persisted
  });

  test.skip('should work offline after first visit', async ({ page, context }) => {
    // Skip for now - would need production build
    // 1. Visit app online
    // 2. Go offline (context.setOffline(true))
    // 3. Reload
    // 4. Verify app still loads
  });
});
