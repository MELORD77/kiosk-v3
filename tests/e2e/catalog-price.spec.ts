import { expect, test } from '@playwright/test';
import { catalogEnvelope, serviceDetail } from '../fixtures/service-catalog';

test('renders the structured paid and free price in all locales and themes', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem('kiosk-language', 'uz');
    localStorage.setItem('kiosk-theme', 'light');
  });
  let isFree = false;
  const price = {
    isFree: false,
    uzs: 11880,
    bhm: 0.027,
    text: {
      uz: '11 880 so‘m',
      cr: '11 880 сўм',
      ru: '11 880 сум',
      en: '11,880 UZS',
    },
    bhmText: {
      uz: '0,027 BHM',
      cr: '0,027 БҲМ',
      ru: '0,027 БРВ',
      en: '0.027 BCA',
    },
  };
  await page.route(`**/api/v3/services/${serviceDetail.id}`, (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(
        catalogEnvelope({
          ...serviceDetail,
          price: { ...price, isFree, bhmText: isFree ? null : price.bhmText },
        }),
      ),
    }),
  );
  await page.goto(`/services/${serviceDetail.id}`);
  for (const [label, field] of [
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
      page.getByText(`${price.text[field]} (${price.bhmText[field]})`, {
        exact: true,
      }),
    ).toBeVisible();
  }
  await page
    .locator('.footer-languages')
    .getByRole('button', { name: 'O‘zbekcha', exact: true })
    .click();
  await expect(page.locator('.kiosk-route')).toHaveCSS('opacity', '1');
  await page
    .getByText('11 880 so‘m (0,027 BHM)', { exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `output/playwright/service-price-light-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.locator('.theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(
    page.getByText('11 880 so‘m (0,027 BHM)', { exact: true }),
  ).toBeVisible();
  await page
    .getByText('11 880 so‘m (0,027 BHM)', { exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `output/playwright/service-price-dark-${testInfo.project.name}.png`,
    fullPage: true,
  });
  isFree = true;
  await page.reload();
  for (const [label, free] of [
    ['O‘zbekcha', 'Bepul'],
    ['Ўзбекча', 'Бепул'],
    ['Русский', 'Бесплатно'],
    ['English', 'Free'],
  ] as const) {
    await page
      .locator('.footer-languages')
      .getByRole('button', { name: label, exact: true })
      .click();
    await expect(page.getByText(free, { exact: true })).toBeVisible();
    await expect(page.getByText(/11.?880/)).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});
