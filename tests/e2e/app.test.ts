import puppeteer, { Browser, Page } from 'puppeteer';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const API_URL = process.env.TEST_API_URL || 'http://localhost:3001';

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
  page.setDefaultTimeout(15000);
});

afterEach(async () => {
  await page.close();
});

describe('Landing Page', () => {
  it('loads the homepage with CTA', async () => {
    await page.goto(BASE_URL);
    await page.waitForSelector('[data-testid="hero"]');

    const heading = await page.$eval('h1', (el) => el.textContent);
    expect(heading).toContain('ready for a pet');

    const cta = await page.$('[data-testid="cta-start"]');
    expect(cta).not.toBeNull();
  });

  it('shows how-it-works steps', async () => {
    await page.goto(BASE_URL);
    await page.waitForSelector('[data-testid="step-1"]');
    await page.waitForSelector('[data-testid="step-2"]');
    await page.waitForSelector('[data-testid="step-3"]');
  });
});

describe('Authentication', () => {
  const testEmail = `test-${Date.now()}@example.com`;

  it('can register a new user', async () => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('[data-testid="auth-form"]');

    await page.type('[data-testid="name-input"]', 'Test User');
    await page.type('[data-testid="email-input"]', testEmail);
    await page.type('[data-testid="password-input"]', 'TestPass123!');

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click('[data-testid="auth-submit"]'),
    ]);

    // Should redirect to quiz
    expect(page.url()).toContain('/quiz');
  });

  it('shows error for duplicate email', async () => {
    // First register
    await fetch(`${API_URL}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dup@test.com', password: 'TestPass123!', name: 'Dup' }),
    });

    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('[data-testid="auth-form"]');
    await page.type('[data-testid="name-input"]', 'Dup User');
    await page.type('[data-testid="email-input"]', 'dup@test.com');
    await page.type('[data-testid="password-input"]', 'TestPass123!');
    await page.click('[data-testid="auth-submit"]');

    await page.waitForSelector('[data-testid="auth-error"]');
    const error = await page.$eval('[data-testid="auth-error"]', (el) => el.textContent);
    expect(error).toContain('already has an account');
  });
});

describe('Quiz Flow', () => {
  it('shows progress bar and questions', async () => {
    // Register and login to get token
    const res = await fetch(`${API_URL}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `quiz-${Date.now()}@test.com`, password: 'TestPass123!', name: 'Quiz User' }),
    });
    const { token } = await res.json();

    await page.goto(`${BASE_URL}/quiz`);
    await page.evaluate((t: string) => localStorage.setItem('token', t), token);
    await page.reload();

    await page.waitForSelector('[data-testid="quiz-question"]');
    await page.waitForSelector('[data-testid="progress-bar"]');

    const question = await page.$eval('[data-testid="quiz-question"]', (el) => el.textContent);
    expect(question).toContain('home');
  });
});

describe('API Health Check', () => {
  it('returns healthy status', async () => {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.service).toBe('petready-api');
  });
});
