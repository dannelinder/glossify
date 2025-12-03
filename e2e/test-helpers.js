// e2e/test-helpers.js

/**
 * Wait for an element to appear (visible or attached) within a timeout.
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 * @param {number} timeout
 * @returns {Promise<boolean>}
 */
async function waitForElementToAppear(page, selector, timeout = 5000) {
  const pollInterval = 100;
  const maxTries = Math.ceil(timeout / pollInterval);
  for (let i = 0; i < maxTries; i++) {
    if (await page.locator(selector).isVisible()) return true;
    if (await page.locator(selector).count() > 0) {
      // If attached but not visible, still consider as appeared for feedback
      return true;
    }
    await page.waitForTimeout(pollInterval);
  }
  return false;
}

module.exports = { waitForElementToAppear };
