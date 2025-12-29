import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PORT ?? 4173);
const host = '127.0.0.1';
const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? `http://${host}:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 5000,
  fullyParallel: true,
  workers: 20,
  expect: {
    timeout: 3000,
  },
  use: {
    baseURL: baseUrl,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `pnpm --dir src/app preview -- --host ${host} --port ${port}`,
    url: `http://${host}:${port}`,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
