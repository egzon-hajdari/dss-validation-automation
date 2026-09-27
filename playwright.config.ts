import { defineConfig, devices } from '@playwright/test';
import { env } from './config/env';

export default defineConfig({
  testDir: './tests',

  /** Server-side validation on the shared demo can be slow: the validation wait + 30 s for the other steps. */
  timeout: env.validationTimeout + 30_000,
  expect: { timeout: 10_000 },

  /** Fail CI if a test.only is left in the code. */
  forbidOnly: !!process.env.CI,

  /** No retries: a flaky result should be visible, not hidden. */
  retries: 0,

  /** printSteps: every page-object action is printed in the terminal. */
  reporter: [
    ['list', { printSteps: true }],
    ['html', { open: 'never' }],
  ],

  use: {
    baseURL: env.baseUrl,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
