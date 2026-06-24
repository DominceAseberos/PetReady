---
name: qa-testing-puppeteer
description: QA testing automation with Puppeteer. Use when writing E2E tests, visual regression tests, or automated browser checks.
---

# QA Testing with Puppeteer

## Setup

```bash
pnpm add -D puppeteer @types/puppeteer
```

## Test Structure

```
tests/
├── e2e/
│   ├── setup.ts            # Browser launch, helpers
│   ├── onboarding.test.ts  # Registration → Quiz → Start
│   ├── simulation.test.ts  # Task completion flow
│   ├── results.test.ts     # Score display, sharing
│   └── helpers/
│       ├── auth.ts         # Login helper
│       ├── navigation.ts   # Page navigation helpers
│       └── assertions.ts   # Custom assertions
```

## Configuration

```typescript
// tests/e2e/setup.ts
import puppeteer, { Browser, Page } from 'puppeteer';

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 720 },
  });
});

afterAll(async () => {
  await browser.close();
});

beforeEach(async () => {
  page = await browser.newPage();
  // Set reasonable timeout
  page.setDefaultTimeout(10000);
});

afterEach(async () => {
  await page.close();
});
```

## Testing Patterns

### Wait Strategies (NEVER use arbitrary sleep)

```typescript
// ✅ Wait for specific element
await page.waitForSelector('[data-testid="dashboard"]');

// ✅ Wait for navigation
await Promise.all([
  page.waitForNavigation(),
  page.click('[data-testid="submit"]'),
]);

// ✅ Wait for network idle
await page.waitForNetworkIdle();

// ❌ NEVER
await new Promise(r => setTimeout(r, 3000));
```

### Element Interaction

```typescript
// Always use data-testid for test selectors (no CSS class dependencies)
await page.click('[data-testid="start-simulation"]');
await page.type('[data-testid="email-input"]', 'test@example.com');

// Check visibility
const isVisible = await page.$eval('[data-testid="score"]', el =>
  window.getComputedStyle(el).display !== 'none'
);
```

### Assertions

```typescript
// Text content
const score = await page.$eval('[data-testid="overall-score"]', el => el.textContent);
expect(Number(score)).toBeGreaterThanOrEqual(0);
expect(Number(score)).toBeLessThanOrEqual(100);

// Element exists
const dashboard = await page.$('[data-testid="simulation-dashboard"]');
expect(dashboard).not.toBeNull();

// URL check
expect(page.url()).toContain('/results');
```

## Critical Test Paths for PetReady

### 1. Onboarding Flow
```
Landing → Click "Start" → Register → Quiz (all questions) → Pet Select → Simulation starts
```

### 2. Task Completion
```
Dashboard → See pending task → Click complete → Confirm feedback → Task marked done
```

### 3. Event Response
```
Event notification appears → Read scenario → Select option → See explanation + cost impact
```

### 4. Results View
```
Simulation complete → Score displayed → Breakdown visible → Prep plan accessible
```

### 5. Share Flow
```
Results page → Click share → Copy link → Open in incognito → Public view loads (no auth)
```

## Accessibility Audit (Automated)

```typescript
// Run Lighthouse accessibility audit
import lighthouse from 'lighthouse';

const result = await lighthouse(page.url(), {
  port: new URL(browser.wsEndpoint()).port,
  output: 'json',
  onlyCategories: ['accessibility'],
});

expect(result.lhr.categories.accessibility.score).toBeGreaterThanOrEqual(0.9);
```

## Visual Regression (Screenshots)

```typescript
// Capture and compare key screens
await page.screenshot({ path: 'screenshots/results-page.png', fullPage: true });

// Compare with baseline (use jest-image-snapshot or similar)
const screenshot = await page.screenshot();
expect(screenshot).toMatchImageSnapshot({
  failureThreshold: 0.01,
  failureThresholdType: 'percent',
});
```

## Performance Checks

```typescript
// Measure page load time
const metrics = await page.metrics();
const performanceTiming = JSON.parse(
  await page.evaluate(() => JSON.stringify(performance.timing))
);

const loadTime = performanceTiming.loadEventEnd - performanceTiming.navigationStart;
expect(loadTime).toBeLessThan(3000); // Under 3 seconds
```

## CI Integration

```yaml
# GitHub Actions - E2E tests
e2e:
  runs-on: ubuntu-latest
  services:
    postgres:
      image: postgres:16
      env:
        POSTGRES_DB: petready_test
        POSTGRES_PASSWORD: test
    redis:
      image: redis:7
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: pnpm install
    - run: pnpm --filter api db:migrate
    - run: pnpm --filter api start &
    - run: pnpm --filter web build && pnpm --filter web start &
    - run: pnpm test:e2e
```

## Rules

- ALL interactive elements MUST have `data-testid` attribute.
- Tests use `data-testid` selectors, NEVER CSS classes.
- No arbitrary `sleep()` — always wait for specific conditions.
- Each test is independent (no shared state between tests).
- Screenshots on failure (for debugging CI).
- Tests run in headless mode by default, headed mode for debugging.
