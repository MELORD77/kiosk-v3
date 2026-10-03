import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/pages',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4174/kiosk-v3/',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'landscape', use: { viewport: { width: 1920, height: 1080 } } },
    { name: 'portrait', use: { viewport: { width: 1080, height: 1920 } } },
    { name: 'compact', use: { viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command:
      'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4174 --strictPort --base /kiosk-v3/',
    url: 'http://127.0.0.1:4174/kiosk-v3/',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
