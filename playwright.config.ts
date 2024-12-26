import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2,  // Add retries
  workers: 1,  // Reduce parallel workers
  timeout: 60000,  // Increase timeout to 60 seconds
  expect: {
    timeout: 60000  // Increase expect timeout
  },
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    actionTimeout: 60000,  // Increase action timeout
    navigationTimeout: 60000,  // Increase navigation timeout
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    }
  ],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,  // Increase server timeout
  },
});