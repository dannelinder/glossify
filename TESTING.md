# Test Coverage

This directory contains test files for the Glossify application.

## Test Structure

### Unit Tests (Jest + React Testing Library)
Located alongside source files with `.test.js` extension:
- `src/components/Flashcard.test.js` - Flashcard component tests
- `src/components/ProgressBar.test.js` - Progress bar tests
- `src/hooks/useFlashcards.test.js` - Flashcard hook logic tests
- `src/utils/getPepp.test.js` - Encouragement message tests


### E2E Tests (Playwright)
Located in the project root `e2e/` directory:
- `e2e/login-glossify-title.spec.ts` - Logs in using environment variables and checks for the Glossify title
- (Add more tests here as needed)

**Note:**
- E2E tests use credentials from environment variables (`TEST_USER`, `TEST_PASSWORD`).
- Set these in your `.env` file in the project root:
  ```env
  TEST_USER=your_test_email@example.com
  TEST_PASSWORD=your_test_password
  ```
- The React app must be running locally at `http://localhost:3000/` before running E2E tests.

## Running Tests


### E2E Tests
```bash
# Run all E2E tests (from project root)
npx playwright test

# Run a specific E2E test
npx playwright test e2e/login-glossify-title.spec.ts

# Run with UI mode (interactive)


# Run in headed mode (see browser)
### E2E Tests
```
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed
```

## Test Coverage Goals

- **Unit Tests**: Cover all utility functions, hooks, and components
- **Integration Tests**: Test component interactions and state management
- **E2E Tests**: Validate critical user journeys (login, practice, settings)
- **Mobile Tests**: Ensure responsive design works on small screens
- **PWA Tests**: Verify offline functionality and installation

## Writing Tests

### Unit Test Example
```javascript
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

test('renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```


### E2E Test Example
```typescript
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
```

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Before deployment

Configure in `.github/workflows/test.yml` (create if deploying to GitHub).
