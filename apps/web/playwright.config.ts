import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config untuk enmarket web e2e tests.
 *
 * Target: web container di localhost:3000 (dev mode).
 * Run: npx playwright test
 * UI mode: npx playwright test --ui
 * Headed: npx playwright test --headed
 */
export default defineConfig({
  testDir: './tests/e2e',
  // Next.js dev mode compile ~20s per page pada first hit. Parallel runs
  // collide — multiple pages compile simultaneously exhaust I/O. Sequential
  // lebih reliable untuk dev mode. CI boleh tetap parallel kalau sudah
  // pre-compile dengan `next build` (production image).
  fullyParallel: false,
  workers: 1,
  // Timeout lebih besar: page pertama compile butuh ~60s pada cold start.
  timeout: 90_000,
  expect: { timeout: 15_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 60_000,

    // Pakai admin token dari env untuk admin tests. Buyer flow tidak butuh.
    extraHTTPHeaders: {
      // Cookie value di-set per-test via context.addCookies()
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});