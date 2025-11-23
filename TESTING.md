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
Located in `e2e/` directory:
- `e2e/glossify.spec.js` - Full application flow tests
- Tests across multiple browsers (Chrome, Firefox, Safari)
- Mobile viewport testing (iPhone, Pixel)

## Running Tests

### Unit Tests
```bash
# Run all unit tests (watch mode)
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests once (CI mode)
npm test -- --watchAll=false
```

### E2E Tests
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
```javascript
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button:has-text("Logga in")');
  await expect(page).toHaveURL(/practice/);
});
```

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Before deployment

Configure in `.github/workflows/test.yml` (create if deploying to GitHub).
