import { expect, test } from '@playwright/test';
import { routeCatalog } from '../e2e/catalog-fixture';
import { catalogServices } from '../fixtures/service-catalog';

for (const theme of ['light', 'dark'] as const) {
  test(`production hash navigation, refresh and assets in ${theme} theme`, async ({
    page,
    request,
  }, testInfo) => {
    const errors: string[] = [];
    const assetResponses: { url: string; status: number; type: string }[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('response', (response) => {
      const type = response.request().resourceType();
      if (['script', 'stylesheet', 'image', 'font'].includes(type)) {
        assetResponses.push({
          url: response.url(),
          status: response.status(),
          type,
        });
      }
    });
    await routeCatalog(page);
    await page.addInitScript((selectedTheme) => {
      localStorage.setItem('kiosk-language', 'en');
      localStorage.setItem('kiosk-theme', selectedTheme);
      localStorage.setItem('kiosk-orientation', 'auto');
    }, theme);
    await page.goto('./');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await page.getByRole('button', { name: /English/ }).click();
    await expect(page).toHaveURL(/\/kiosk-v3\/#\/home$/);
    await expect(page.locator('.service-card')).toHaveCount(24);
    await expect(
      page.getByText('Developer settings', { exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole('button', { name: 'Certificates', exact: true })
      .click();
    await expect(page.locator('.service-card')).toHaveCount(2);
    const service = catalogServices.find((item) => item.number === 12);
    if (!service) throw new Error('Certificate fixture is unavailable');
    await page.getByText(service.lang.en, { exact: true }).click();
    const serviceURL = `/kiosk-v3/#/services/${service.id}`;
    expect(new URL(page.url()).pathname + new URL(page.url()).hash).toBe(
      serviceURL,
    );
    await expect(
      page.getByRole('heading', { name: service.lang.en }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole('heading', { name: service.lang.en }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page
      .getByRole('button', { name: 'Enter manually', exact: true })
      .click();
    await expect(page.getByLabel('PINFL', { exact: true })).toHaveValue('');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.locator('body')).toHaveJSProperty(
      'scrollWidth',
      await page.evaluate(() => document.documentElement.clientWidth),
    );
    await page.screenshot({
      path: `output/playwright/pages-${theme}-${testInfo.project.name}.png`,
      fullPage: true,
    });
    await page.getByRole('button', { name: 'Finish', exact: true }).click();
    await expect(page.getByRole('button', { name: /English/ })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: /English/ })).toBeVisible();

    const manifestURL = await page
      .locator('link[rel="manifest"]')
      .evaluate((link) => (link instanceof HTMLLinkElement ? link.href : ''));
    expect(new URL(manifestURL).pathname).toBe(
      '/kiosk-v3/manifest.webmanifest',
    );
    const manifestResponse = await request.get(manifestURL);
    expect(manifestResponse.ok()).toBe(true);
    expect(manifestResponse.headers()['content-type']).toContain('json');
    expect(await manifestResponse.text()).toContain('icons/kiosk-192.png');
    await page.evaluate(() => document.fonts.ready);
    for (const type of ['script', 'stylesheet', 'image', 'font']) {
      expect(assetResponses.some((response) => response.type === type)).toBe(
        true,
      );
    }
    for (const response of assetResponses) {
      expect(new URL(response.url).pathname, response.url).toMatch(
        /^\/kiosk-v3\//,
      );
      expect(response.status, response.url).toBeLessThan(400);
    }

    await page.goto('./#/core-demo?devtools=1');
    await expect(
      page.getByRole('heading', { name: 'Page not found' }),
    ).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: 'Example label' }),
    ).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
