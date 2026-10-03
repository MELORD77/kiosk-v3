import type { Page } from '@playwright/test';
import { catalogResponse } from '../fixtures/service-catalog';

export async function routeCatalog(page: Page) {
  await page.route('**/api/v3/services**', async (route) => {
    const response = catalogResponse(new URL(route.request().url()));
    await route.fulfill({
      status: response.status,
      contentType: 'application/json',
      body: await response.text(),
    });
  });
}
