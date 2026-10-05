import { expect, test } from '@playwright/test';
import {
  catalogEnvelope,
  catalogServices,
  serviceDetail,
} from '../fixtures/service-catalog';
import { routeCatalog } from './catalog-fixture';

test('shows API availability and localized requirements in both themes', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem('kiosk-language', 'en');
    localStorage.setItem('kiosk-theme', 'light');
  });
  await routeCatalog(page);
  const services = catalogServices.slice(0, 3).map((service, index) => ({
    ...service,
    status: ['ACTIVE', 'IN_PROGRESS', 'MAINTENANCE'][index],
    lang: { ...service.lang, en: `Availability service ${index}` },
  }));
  await page.route('**/api/v3/services', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(catalogEnvelope(services)),
    }),
  );
  for (const theme of ['light', 'dark']) {
    await page.goto('/home');
    if (theme === 'dark') {
      await page
        .getByRole('button', { name: 'Dark mode', exact: true })
        .click();
    }
    const cards = page.locator('.service-card');
    await expect(cards).toHaveCount(3);
    await expect(cards.nth(0)).toBeEnabled();
    await expect(cards.nth(1)).toBeDisabled();
    await expect(cards.nth(1)).toContainText('Coming soon');
    await expect(cards.nth(2)).toBeDisabled();
    await expect(cards.nth(2)).toContainText('Temporarily unavailable');
    await expect(page.locator('.kiosk-route')).toHaveCSS('opacity', '1');
    await expect(page.locator('.service-grid-content')).toHaveCSS(
      'opacity',
      '1',
    );
    await expect(cards.nth(0)).toHaveCSS('opacity', '1');
    await expect(cards.nth(1)).toHaveCSS('opacity', '0.6');
    await expect(cards.nth(2)).toHaveCSS('opacity', '1');
    await expect(page.locator('body')).toHaveJSProperty(
      'scrollWidth',
      testInfo.project.use.viewport?.width,
    );
    await page.screenshot({
      path: `output/playwright/catalog-status-${theme}-${testInfo.project.name}.png`,
      fullPage: true,
    });
  }
  const active = services[0];
  const unavailable = services[1];
  if (!active || !unavailable) throw new Error('Status fixture is incomplete');
  await page.route(`**/api/v3/services/${unavailable.id}`, (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(catalogEnvelope(unavailable)),
    }),
  );
  await page.goto(`/services/${unavailable.id}`);
  await expect(page.getByText('Coming soon', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toHaveCount(0);
  const documents = {
    uz: 'Pasport nusxasi',
    cr: 'Паспорт нусхаси',
    ru: 'Копия паспорта',
    en: 'Passport copy\nOriginal document',
  };
  const verification = {
    uz: 'Shaxsni tekshirish',
    cr: 'Шахсни текшириш',
    ru: 'Проверка личности',
    en: 'Identity check',
  };
  await page.route(`**/api/v3/services/${active.id}`, (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(
        catalogEnvelope({
          ...serviceDetail,
          ...active,
          documents,
          verification,
        }),
      ),
    }),
  );
  await page.goto(`/services/${active.id}`);
  for (const [label, language] of [
    ['O‘zbekcha', 'uz'],
    ['Ўзбекча', 'cr'],
    ['Русский', 'ru'],
    ['English', 'en'],
  ] as const) {
    await page
      .locator('.footer-languages')
      .getByRole('button', { name: label, exact: true })
      .click();
    await expect(
      page.getByText(documents[language], { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(verification[language], { exact: true }),
    ).toBeVisible();
  }
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toBeEnabled();
  await expect(page.locator('.kiosk-route')).toHaveCSS('opacity', '1');
  await page.screenshot({
    path: `output/playwright/service-requirements-${testInfo.project.name}.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
