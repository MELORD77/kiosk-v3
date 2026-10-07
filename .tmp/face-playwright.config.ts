import { defineConfig } from '@playwright/test';
import config from '../playwright.config';

export default defineConfig({
  ...config,
  testDir: '../tests/e2e',
  workers: 2,
  use: { ...config.use, channel: 'chrome' },
  webServer: {
    command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173',
    cwd: process.cwd(),
    url: 'https://127.0.0.1:5173',
    ignoreHTTPSErrors: true,
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
