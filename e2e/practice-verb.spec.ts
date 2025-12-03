import { test, expect } from '@playwright/test';
const { waitForElementToAppear } = require('./test-helpers');

const TEST_EMAIL = 'meeratesta@gmail.com';
const TEST_PASSWORD = 'Sn0b@lls@r3n0tusu@lly$33nInth3Summ3r';

// The verb pairs to seed and mock (must match glossify/src/data/verbs.js)
const wordPairs = [
  'besöka;besuchen',
  'du gör;du machst',
  'jag åker;ich fahre',
  'ni vinner;ihr gewinnt',
  'vi älskar;wir lieben'
].sort((a, b) => a.split(';')[0].localeCompare(b.split(';')[0]));
const wordMap = Object.fromEntries(wordPairs.map(pair => pair.split(';')));

test.beforeEach(async ({ page }) => {
  // Ensure deterministic mode in the app for all tests
  await page.addInitScript(() => {
    window.__TEST_MODE__ = true;
  });
  // Mock Supabase word list fetch for 'weeklyWords' to always return our seeded list
  await page.route('**/rest/v1/word_lists*', async (route, request) => {
    if (request.method() === 'GET' && request.url().includes('verbs')) {
      // Always return both name and content for robustness
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ name: 'verbs', content: wordPairs.join('\n') }]),
      });
    }
    return route.continue();
  });
  await page.goto('http://localhost:3000/');
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  const menuAppeared = await waitForElementToAppear(page, '#verb-btn', 8000);
  expect(menuAppeared).toBeTruthy();
});

test.describe('Verb - Practice functionality', () => {
  test('correct answered verb should give positive feedback', async ({ page }) => {
    // Go to Verb practice page
    await page.locator('#verb-btn').click();
    await page.waitForURL('**/practice/verbs');
    await expect(page).toHaveURL(/\/practice\/verbs/);

    // Wait for flashcard input and Svara button (robust)
    const svarAppeared = await waitForElementToAppear(page, '#svar', 8000);
    expect(svarAppeared).toBeTruthy();
    await expect(page.locator('#svar')).toBeEnabled({ timeout: 8000 });
    const svaraBtnAppeared = await waitForElementToAppear(page, '#svara-btn', 8000);
    expect(svaraBtnAppeared).toBeTruthy();
    await expect(page.locator('#svara-btn')).toBeEnabled({ timeout: 8000 });

    // Always answer the first card using the seeded wordPairs mapping
    const swedishVerb = (await page.locator('#flashcard-front').innerText()).trim();
    const expectedAnswer = wordMap[swedishVerb];
    expect(expectedAnswer).toBeTruthy();
    await page.fill('#svar', expectedAnswer);
    await page.click('#svara-btn');

    // Wait for feedback to appear and contain the expected text (robust)
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
      await page.screenshot({ path: 'diagnostic-positive-feedback.png', fullPage: true });
      const html = await page.content();
      console.log('POSITIVE FEEDBACK TEST: .feedback-success not found or text mismatch. Page HTML:', html);
    }
    expect(feedbackAppeared).toBeTruthy();
  });

  test('incorrect answered verb should see correct answer in feedback', async ({ page }) => {
    // Go to Verb practice page
    await page.locator('#verb-btn').click();
    await page.waitForURL('**/practice/verbs');
    await expect(page).toHaveURL(/\/practice\/verbs/);

    const svarAppeared = await waitForElementToAppear(page, '#svar', 8000);
    expect(svarAppeared).toBeTruthy();
    await expect(page.locator('#svar')).toBeEnabled({ timeout: 8000 });
    const svaraBtnAppeared = await waitForElementToAppear(page, '#svara-btn', 8000);
    expect(svaraBtnAppeared).toBeTruthy();
    await expect(page.locator('#svara-btn')).toBeEnabled({ timeout: 8000 });

    // Always read the current verb from the flashcard BEFORE answering
    const swedishVerb = (await page.locator('#flashcard-front').innerText()).trim();
    const correctAnswer = wordMap[swedishVerb];

    // Enter an incorrect answer
    await page.fill('#svar', 'fel');
    await page.click('#svara-btn');
    // Wait for feedback to appear and check that it contains the correct answer for the verb just answered
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
      await page.screenshot({ path: 'diagnostic-incorrect-feedback.png', fullPage: true });
      const html = await page.content();
      console.log('INCORRECT FEEDBACK TEST: .feedback-error not found or text mismatch. Page HTML:', html);
    }
    expect(feedbackAppeared).toBeTruthy();
    // Wait for the flashcard to update (new verb or feedback disappears)
    let tries = 0;
    while (tries < 20) {
      await page.waitForTimeout(100);
      const newVerb = (await page.locator('#flashcard-front').innerText()).trim();
      if (newVerb !== swedishVerb) break;
      tries++;
    }
  });

  test('three correct answered verbs in a row should give streak feedback', async ({ page }) => {
    // Go to Verb practice page
    await page.locator('#verb-btn').click();
    await page.waitForURL('**/practice/verbs');
    await expect(page).toHaveURL(/\/practice\/verbs/);

    const svarAppeared = await waitForElementToAppear(page, '#svar', 8000);
    expect(svarAppeared).toBeTruthy();
    await expect(page.locator('#svar')).toBeEnabled({ timeout: 8000 });
    const svaraBtnAppeared = await waitForElementToAppear(page, '#svara-btn', 8000);
    expect(svaraBtnAppeared).toBeTruthy();
    await expect(page.locator('#svara-btn')).toBeEnabled({ timeout: 8000 });

    // Answer three unique verbs in a row, always waiting for the flashcard to update
    const seenVerbs = new Set();
    let answersGiven = 0;
    let lastVerb = '';
    while (answersGiven < 3) {
      // Wait for a new verb to appear
      let swedishVerb = await page.locator('#flashcard-front').innerText();
      swedishVerb = swedishVerb.trim();
      let tries = 0;
      while ((swedishVerb === lastVerb || seenVerbs.has(swedishVerb)) && tries < 20) {
        await page.waitForTimeout(100);
        swedishVerb = (await page.locator('#flashcard-front').innerText()).trim();
        tries++;
      }
      if (seenVerbs.has(swedishVerb)) {
        // If still duplicate after max tries, break to avoid infinite loop
        break;
      }
      seenVerbs.add(swedishVerb);
      lastVerb = swedishVerb;
      const answer = wordMap[swedishVerb];
      await page.fill('#svar', answer);
      await page.click('#svara-btn');
      answersGiven++;
      // After the third answer, wait for feedback to appear (robust to fast UI)
      if (answersGiven === 3) {
        const feedbackAppeared = await waitForElementToAppear(page, '#streak-message', 8000);
        expect(feedbackAppeared).toBeTruthy();
      }
    }
  });

  test('restart session when clicking should "Börja om"', async ({ page }) => {
    await page.locator('#verb-btn').click();
    await page.waitForURL('**/practice/verbs');
    await expect(page.locator('button:has-text("Börja om")')).toHaveCount(0);
    for (const swedishVerb of Object.keys(wordMap)) {
      await page.fill('#svar', wordMap[swedishVerb]);
      await page.click('#svara-btn');
      await waitForElementToAppear(page, '.feedback-success, .feedback-error', 2000);
      await page.waitForTimeout(100);
      await page.waitForSelector('.feedback-success, .feedback-error', { state: 'detached', timeout: 4000 });
    }
    const sessionCompleteAppeared = await waitForElementToAppear(page, '#session-complete-title', 8000);
    expect(sessionCompleteAppeared).toBeTruthy();
    await expect(page.locator('button:has-text("Börja om")')).toBeVisible();
    await page.click('button:has-text("Börja om")');
    const flashcardAppeared = await waitForElementToAppear(page, '#flashcard-front', 5000);
    expect(flashcardAppeared).toBeTruthy();
    const firstVerb = Object.keys(wordMap)[0];
    await expect(page.locator('#flashcard-front')).toHaveText(firstVerb);
    await expect(page.locator('button:has-text("Börja om")')).toHaveCount(0);
  });

  test('should practice only wrong answers when clicking "Öva fel svar"', async ({ page }) => {
    await page.locator('#verb-btn').click();
    await page.waitForURL('**/practice/verbs');
    const swedishVerbs = Object.keys(wordMap);
    await expect(page.locator('button:has-text("Öva fel svar")')).toHaveCount(0);
    await page.fill('#svar', 'fel');
    await page.click('#svara-btn');
    await page.waitForTimeout(1000);
    for (let i = 1; i < swedishVerbs.length; i++) {
      await page.fill('#svar', wordMap[swedishVerbs[i]]);
      await page.click('#svara-btn');
      await waitForElementToAppear(page, '.feedback-success, .feedback-error', 2000);
      await page.waitForTimeout(100);
      await page.waitForSelector('.feedback-success, .feedback-error', { state: 'detached', timeout: 4000 });
    }
    const sessionCompleteAppeared = await waitForElementToAppear(page, '#session-complete-title', 8000);
    expect(sessionCompleteAppeared).toBeTruthy();
    await expect(page.locator('button:has-text("Öva fel svar")')).toBeVisible();
    await page.click('button:has-text("Öva fel svar")');
    await expect(page.locator('#flashcard-front')).toHaveText(swedishVerbs[0]);
    await page.fill('#svar', wordMap[swedishVerbs[0]]);
    await page.click('#svara-btn');
    await expect(page.locator('#session-complete-title')).toBeVisible();
    await expect(page.locator('button:has-text("Öva fel svar")')).toHaveCount(0);
  });
});