import { defineConfig, devices } from '@playwright/test';

const reporters: any[] = [
  ['html', { outputFolder: 'reports/playwright-html', open: 'never' }],
  ['json', { outputFile: 'reports/playwright-results.json' }],
  ['junit', { outputFile: 'reports/test-results.xml' }],
  ['list'],
]

// Enable Allure only if explicitly requested and plugin is installed
if (process.env.PW_ALLURE === '1') {
  reporters.push(['allure-playwright', { outputFolder: 'reports/allure-results' }])
}

export default defineConfig({
  testDir: './',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: reporters,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'] },
    },
  ],

  // Exclude API tests from Playwright (now handled by Mocha)
  testIgnore: ['**/api/**'],

  webServer: {
    command: 'npm run dev --prefix ..',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});