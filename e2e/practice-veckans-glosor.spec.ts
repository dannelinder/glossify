import { test, expect } from '@playwright/test';
const { waitForElementToAppear } = require('./test-helpers');

const TEST_EMAIL = 'meeratesta@gmail.com';
const TEST_PASSWORD = 'Sn0b@lls@r3n0tusu@lly$33nInth3Summ3r';

// The word pairs to seed and mock (must match glossify/src/data/weeklyWords.js)
const wordPairs = [
  'ansiktet;das Gesicht',
  'fingret;der Finger',
  'huvudet;der Kopf',
  'munnen;der Mund',
  'pannan;die Stirn'
].sort((a, b) => a.split(';')[0].localeCompare(b.split(';')[0]));
const wordMap = Object.fromEntries(wordPairs.map(pair => pair.split(';')));

test.beforeEach(async ({ page }) => {
  // Ensure deterministic mode in the app for all tests
  await page.addInitScript(() => {
    window.__TEST_MODE__ = true;
  });
  // Mock Supabase word list fetch for 'weeklyWords' to always return our seeded list
  await page.route('**/rest/v1/word_lists*', async (route, request) => {
    if (request.method() === 'GET' && request.url().includes('weeklyWords')) {
      // Always return both name and content for robustness
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ name: 'weeklyWords', content: wordPairs.join('\n') }]),
      });
    }
    return route.continue();
  });
  await page.goto('http://localhost:3000/');
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  const menuAppeared = await waitForElementToAppear(page, '#veckans-glosor-btn', 8000);
  expect(menuAppeared).toBeTruthy();
});

test.describe('Veckans glosor - Practice functionality', () => {
  test(' restart session when clicking should "Börja om"', async ({ page }) => {
    await page.locator('#veckans-glosor-btn').click();
    await page.waitForURL('**/practice/weekly');
    await expect(page.locator('button:has-text("Börja om")')).toHaveCount(0);
    for (const swedishWord of Object.keys(wordMap)) {
      await page.fill('#svar', wordMap[swedishWord]);
      await page.click('#svara-btn');
      await waitForElementToAppear(page, '.feedback-success, .feedback-error', 2000);
      await page.waitForTimeout(100); // small buffer
      await page.waitForSelector('.feedback-success, .feedback-error', { state: 'detached', timeout: 4000 });
    }
    const sessionCompleteAppeared = await waitForElementToAppear(page, '#session-complete-title', 8000);
    expect(sessionCompleteAppeared).toBeTruthy();
    await expect(page.locator('button:has-text("Börja om")')).toBeVisible();
    await page.click('button:has-text("Börja om")');
    const flashcardAppeared = await waitForElementToAppear(page, '#flashcard-front', 5000);
    expect(flashcardAppeared).toBeTruthy();
    const firstWord = wordPairs[0].split(';')[0];
    await expect(page.locator('#flashcard-front')).toHaveText(firstWord);
    await expect(page.locator('button:has-text("Börja om")')).toHaveCount(0);
  });

  test('should practice only wrong answers when clicking "Öva fel svar"', async ({ page }) => {
    await page.locator('#veckans-glosor-btn').click();
    await page.waitForURL('**/practice/weekly');
    const swedishWords = Object.keys(wordMap);
    // Before answering all, "Öva fel svar" should not be visible
    await expect(page.locator('button:has-text("Öva fel svar")')).toHaveCount(0);
    // Answer first word wrong, rest correct
    await page.fill('#svar', 'fel');
    await page.click('#svara-btn');
    await page.waitForTimeout(1000);
    for (let i = 1; i < swedishWords.length; i++) {
      await page.fill('#svar', wordMap[swedishWords[i]]);
      await page.click('#svara-btn');
      // Wait for feedback to appear and disappear before next answer
      await waitForElementToAppear(page, '.feedback-success, .feedback-error', 2000);
      await page.waitForTimeout(100);
      await page.waitForSelector('.feedback-success, .feedback-error', { state: 'detached', timeout: 4000 });
    }
    // Now "Öva fel svar" should appear with session complete
    const sessionCompleteAppeared = await waitForElementToAppear(page, '#session-complete-title', 8000);
    expect(sessionCompleteAppeared).toBeTruthy();
    await expect(page.locator('button:has-text("Öva fel svar")')).toBeVisible();
    // Click "Öva fel svar" (Practice wrong answers)
    await page.click('button:has-text("Öva fel svar")');
    // Should show only the first word again (the one answered wrong)
    await expect(page.locator('#flashcard-front')).toHaveText(swedishWords[0]);
    // Answer it correctly to finish
    await page.fill('#svar', wordMap[swedishWords[0]]);
    await page.click('#svara-btn');
    await expect(page.locator('#session-complete-title')).toBeVisible();
    // After all wrongs are corrected, "Öva fel svar" should not be visible
    await expect(page.locator('button:has-text("Öva fel svar")')).toHaveCount(0);
  });

  test('correct answered word should give positive feedback', async ({ page }) => {
    await page.locator('#veckans-glosor-btn').click();
    await page.waitForURL('**/practice/weekly');
    await expect(page).toHaveURL(/\/practice\/weekly/);
    const svarAppeared = await waitForElementToAppear(page, '#svar', 8000);
    expect(svarAppeared).toBeTruthy();
    await expect(page.locator('#svar')).toBeEnabled({ timeout: 8000 });
    const svaraBtnAppeared = await waitForElementToAppear(page, '#svara-btn', 8000);
    expect(svaraBtnAppeared).toBeTruthy();
    await expect(page.locator('#svara-btn')).toBeEnabled({ timeout: 8000 });
    const swedishWord = (await page.locator('#flashcard-front').innerText()).trim();
    const expectedAnswer = wordMap[swedishWord];
    expect(expectedAnswer).toBeTruthy();
    await page.fill('#svar', expectedAnswer);
    await page.click('#svara-btn');
    let feedbackAppeared = false;
    let feedbackText = '';
    const start = Date.now();
    while (Date.now() - start < 4000) {
      if (await page.locator('.feedback-success').isVisible()) {
        feedbackText = await page.locator('.feedback-success').innerText();
        if (feedbackText.includes('✓ Rätt')) {
          feedbackAppeared = true;
          break;
        }
      }
      await page.waitForTimeout(100);
    }
    if (!feedbackAppeared) {
      await page.screenshot({ path: 'diagnostic-positive-feedback-weekly.png', fullPage: true });
      const html = await page.content();
      console.log('POSITIVE FEEDBACK TEST: .feedback-success not found or text mismatch. Page HTML:', html);
    }
    expect(feedbackAppeared).toBeTruthy();
  });

  test('incorrect answered word should see correct answer in feedback', async ({ page }) => {
    await page.locator('#veckans-glosor-btn').click();
    await page.waitForURL('**/practice/weekly');
    await expect(page).toHaveURL(/\/practice\/weekly/);
    const svarAppeared = await waitForElementToAppear(page, '#svar', 8000);
    expect(svarAppeared).toBeTruthy();
    await expect(page.locator('#svar')).toBeEnabled({ timeout: 8000 });
    const svaraBtnAppeared = await waitForElementToAppear(page, '#svara-btn', 8000);
    expect(svaraBtnAppeared).toBeTruthy();
    await expect(page.locator('#svara-btn')).toBeEnabled({ timeout: 8000 });
    const swedishWord = (await page.locator('#flashcard-front').innerText()).trim();
    const correctAnswer = wordMap[swedishWord];
    await page.fill('#svar', 'fel');
    await page.click('#svara-btn');
    let feedbackAppeared = false;
    let feedbackText = '';
    const start = Date.now();
    while (Date.now() - start < 4000) {
      if (await page.locator('.feedback-error').isVisible()) {
        feedbackText = await page.locator('.feedback-error').innerText();
        if (feedbackText.includes(correctAnswer)) {
          feedbackAppeared = true;
          break;
        }
      }
      await page.waitForTimeout(100);
    }
    if (!feedbackAppeared) {
      await page.screenshot({ path: 'diagnostic-incorrect-feedback-weekly.png', fullPage: true });
      const html = await page.content();
      console.log('INCORRECT FEEDBACK TEST: .feedback-error not found or text mismatch. Page HTML:', html);
    }
    expect(feedbackAppeared).toBeTruthy();
    let tries = 0;
    while (tries < 20) {
      await page.waitForTimeout(100);
      const newWord = (await page.locator('#flashcard-front').innerText()).trim();
      if (newWord !== swedishWord) break;
      tries++;
    }
  });

  test('three correct answered words in a row should give streak feedback', async ({ page }) => {
    await page.locator('#veckans-glosor-btn').click();
    await page.waitForURL('**/practice/weekly');
    await expect(page).toHaveURL(/\/practice\/weekly/);
    const svarAppeared = await waitForElementToAppear(page, '#svar', 8000);
    expect(svarAppeared).toBeTruthy();
    await expect(page.locator('#svar')).toBeEnabled({ timeout: 8000 });
    const svaraBtnAppeared = await waitForElementToAppear(page, '#svara-btn', 8000);
    expect(svaraBtnAppeared).toBeTruthy();
    await expect(page.locator('#svara-btn')).toBeEnabled({ timeout: 8000 });
    const seenWords = new Set();
    let answersGiven = 0;
    let lastWord = '';
    while (answersGiven < 3) {
      let swedishWord = await page.locator('#flashcard-front').innerText();
      swedishWord = swedishWord.trim();
      let tries = 0;
      while ((swedishWord === lastWord || seenWords.has(swedishWord)) && tries < 20) {
        await page.waitForTimeout(100);
        swedishWord = (await page.locator('#flashcard-front').innerText()).trim();
        tries++;
      }
      if (seenWords.has(swedishWord)) {
        break;
      }
      seenWords.add(swedishWord);
      lastWord = swedishWord;
      const answer = wordMap[swedishWord];
      await page.fill('#svar', answer);
      await page.click('#svara-btn');
      answersGiven++;
      if (answersGiven === 3) {
        const feedbackAppeared = await waitForElementToAppear(page, '#streak-message', 8000);
        expect(feedbackAppeared).toBeTruthy();
      }
    }
  });
});