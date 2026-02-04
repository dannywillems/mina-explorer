import { defineConfig } from '@playwright/test';

// Support testing against deployed website
const isDeployed = process.env.TEST_DEPLOYED === 'true';
const deployedUrl = 'https://dannywillems.github.io/mina-explorer';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  expect: {
    timeout: 20000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: isDeployed ? deployedUrl : 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  ...(isDeployed
    ? {}
    : {
        webServer: {
          command: 'npx vite --port 5173',
          port: 5173,
          reuseExistingServer: !process.env.CI,
          timeout: 120000,
        },
      }),
});
