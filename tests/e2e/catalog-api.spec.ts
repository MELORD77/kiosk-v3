import { expect, test } from '@playwright/test';
import {
  catalogCategories,
  catalogEnvelope,
  catalogServices,
} from '../fixtures/service-catalog';
import { routeCatalog } from './catalog-fixture';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('kiosk-language', 'en');
    localStorage.setItem('kiosk-theme', 'dark');
  });
  await routeCatalog(page);
});

test('keeps the service grid layout while waiting for the API', async ({
  page,
}, testInfo) => {
  let release = () => {};
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/v3/services', async (route) => {
    await pending;
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(catalogEnvelope(catalogServices)),
    });
  });
  try {
    await page.goto('/home');
    await expect(page.locator('.service-card-skeleton')).toHaveCount(6);
    await expect(
      page
        .getByRole('region', { name: 'Services', exact: true })
        .getByRole('status'),
    ).toContainText('Loading');
    const skeletonTop = await page
      .locator('.service-card-skeleton')
      .first()
      .boundingBox();
    const gridTop = await page.locator('.service-grid-loading').boundingBox();
    if (!skeletonTop || !gridTop)
      throw new Error('Loading geometry is unavailable');
    expect(skeletonTop.y).toBe(gridTop.y);
    await page.screenshot({
      path: `output/playwright/state-loader-dark-${testInfo.project.name}.png`,
      fullPage: true,
    });
  } finally {
    release();
  }
  await expect(page.locator('.service-card')).toHaveCount(24);
});

test('renders changed backend names, counts and order instead of static design content', async ({
  page,
}) => {
  const renamedServices = [...catalogServices].reverse().map((service) => ({
    ...service,
    lang: { ...service.lang, en: `Server service ${service.number}` },
  }));
  await page.route('**/api/v3/services', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(catalogEnvelope(renamedServices)),
    }),
  );
  await page.route('**/api/v3/services/categories', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(
        catalogEnvelope([
          {
            key: 'custom',
            lang: {
              uz: 'Server',
              cr: 'Server',
              ru: 'Server',
              en: 'Server category',
            },
            servicesCount: 24,
          },
        ]),
      ),
    }),
  );
  await page.goto('/home');
  await expect(page.locator('.service-card').first()).toContainText(
    'Server service 24',
  );
  await expect(
    page.getByRole('button', { name: 'Server category', exact: true }),
  ).toContainText('24');
  await expect(
    page.getByRole('button', { name: 'All services', exact: true }),
  ).toContainText('24');
});

test('uses server filters, named routes and all four server translations', async ({
  page,
}, testInfo) => {
  const calls: URL[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/v3/services'))
      calls.push(new URL(request.url()));
  });
  await page.goto('/home');
  await expect(page.locator('.service-card')).toHaveCount(24);
  await page.getByRole('button', { name: 'Certificates', exact: true }).click();
  await expect(page.locator('.service-card')).toHaveCount(2);
  expect(calls.some((url) => url.search === '?category=cert')).toBe(true);
  const service = catalogServices.find((item) => item.number === 12);
  if (!service) throw new Error('Catalog fixture is incomplete');
  for (const [label, title] of [
    ['O‘zbekcha', service.lang.uz],
    ['Ўзбекча', service.lang.cr],
    ['Русский', service.lang.ru],
    ['English', service.lang.en],
  ]) {
    await page
      .locator('.footer-languages')
      .getByRole('button', { name: label, exact: true })
      .click();
    await expect(page.getByText(title, { exact: true })).toBeVisible();
  }
  await page.getByText(service.lang.en, { exact: true }).click();
  await expect(page).toHaveURL(/\/services\/criminal-record$/);
  await expect(
    page.getByRole('heading', { name: service.lang.en }),
  ).toBeVisible();
  await expect(
    page.getByText('About this service', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page
    .getByRole('button', { name: 'Enter manually', exact: true })
    .click();
  await expect(page.getByLabel('PINFL', { exact: true })).toHaveValue('');
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toBeEnabled();
  await page.screenshot({
    path: `output/playwright/identity-pin-dark-${testInfo.project.name}.png`,
    fullPage: true,
  });
  const pin = page.getByLabel('PINFL', { exact: true });
  const continueButton = page.getByRole('button', {
    name: 'Continue',
    exact: true,
  });
  const pinError = page.getByText('Enter exactly 14 digits', { exact: true });
  await pin.fill('1');
  await pin.blur();
  await expect(pinError).toBeHidden();
  await page
    .getByRole('button', { name: 'Delete last character', exact: true })
    .click();
  await expect(pin).toHaveValue('');
  await expect(pinError).toBeHidden();
  await continueButton.click();
  await expect(pinError).toBeVisible();
  await pin.fill('0000000000000');
  await pin.blur();
  await expect(pinError).toBeHidden();
  await continueButton.click();
  await expect(pinError).toBeVisible();
  await page.getByRole('button', { name: '0', exact: true }).click();
  await expect(pinError).toBeHidden();
  await continueButton.click();
  await expect(
    page.getByText('Input format is correct', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Passport', exact: true }).click();
  await page.getByRole('button', { name: 'A', exact: true }).click();
  await page.getByRole('button', { name: 'A', exact: true }).click();
  await expect(page.getByLabel('Passport series', { exact: true })).toHaveValue(
    'AA',
  );
  for (let digit = 0; digit < 7; digit += 1) {
    await page.getByRole('button', { name: '0', exact: true }).click();
  }
  await expect(page.getByLabel('Passport number', { exact: true })).toHaveValue(
    '0000000',
  );
  await page.getByLabel('Birth date', { exact: true }).fill('15.04.1990');
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toBeEnabled();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(
    page.getByText('Input format is correct', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('body')).toHaveJSProperty(
    'scrollWidth',
    await page.evaluate(() => document.documentElement.clientWidth),
  );
  await page.screenshot({
    path: `output/playwright/identity-passport-dark-${testInfo.project.name}.png`,
    fullPage: true,
  });
  expect(
    calls.some((url) => url.pathname === `/api/v3/services/${service.id}`),
  ).toBe(true);
  expect(
    calls.every((url) =>
      [...url.searchParams.keys()].every((key) => key === 'category'),
    ),
  ).toBe(true);
  await page.screenshot({
    path: `output/playwright/catalog-api-dark-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test('shows empty services and recovers a catalog error with retry', async ({
  page,
}) => {
  let fail = true;
  await page.route('**/api/v3/services', (route) =>
    route.fulfill({
      status: fail ? 400 : 200,
      contentType: 'application/json',
      body: JSON.stringify(
        fail ? { error: 'Validation Error!' } : catalogEnvelope([]),
      ),
    }),
  );
  await page.goto('/home');
  await expect(page.getByRole('alert')).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.locator('.service-card')).toHaveCount(0);
  await expect(page.getByRole('status')).toBeVisible();
});

test('shows a 404 for missing UUID and rejects invalid IDs without a detail request', async ({
  page,
}) => {
  await page.goto('/services/00000000-0000-4000-8000-999999999999');
  await expect(
    page.getByRole('heading', { name: 'Page not found' }),
  ).toBeVisible();
  let invalidRequests = 0;
  page.on('request', (request) => {
    if (request.url().includes('/api/v3/services/not-a-uuid'))
      invalidRequests += 1;
  });
  await page.goto('/services/not-a-uuid');
  await expect(
    page.getByRole('heading', { name: 'Page not found' }),
  ).toBeVisible();
  expect(invalidRequests).toBe(0);
});

test('shows category errors separately and recovers their retry', async ({
  page,
}) => {
  let fail = true;
  await page.route('**/api/v3/services/categories', (route) =>
    route.fulfill({
      status: fail ? 400 : 200,
      contentType: 'application/json',
      body: JSON.stringify(
        fail
          ? { error: 'Validation Error!' }
          : catalogEnvelope(catalogCategories),
      ),
    }),
  );
  await page.goto('/home');
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.locator('.service-card')).toHaveCount(24);
  fail = false;
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Certificates', exact: true }),
  ).toBeVisible();
});
