import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import uz from '../../src/shared/lib/i18n/locales/uz.json' with { type: 'json' };
import uzc from '../../src/shared/lib/i18n/locales/uzc.json' with { type: 'json' };
import ru from '../../src/shared/lib/i18n/locales/ru.json' with { type: 'json' };
import en from '../../src/shared/lib/i18n/locales/en.json' with { type: 'json' };
import { catalogEnvelope, serviceDetail } from '../fixtures/service-catalog';
import { routeCatalog } from './catalog-fixture';

const viewports = [
  { width: 1920, height: 1080, theme: 'light' },
  { width: 1920, height: 1080, theme: 'dark' },
  { width: 1080, height: 1920, theme: 'light' },
  { width: 1080, height: 1920, theme: 'dark' },
  { width: 1280, height: 800, theme: 'light' },
  { width: 800, height: 600, theme: 'light' },
  { width: 390, height: 844, theme: 'light' },
];

async function openIdentityForm(page: Page, theme: string) {
  await page.addInitScript(
    ({ theme }) => {
      localStorage.setItem('kiosk-language', 'uz');
      localStorage.setItem('kiosk-theme', theme);
      localStorage.setItem('kiosk-orientation', 'auto');
    },
    { theme },
  );
  await routeCatalog(page);
  await page.route(`**/api/v3/services/${serviceDetail.id}`, (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(catalogEnvelope(serviceDetail)),
    }),
  );
  await page.goto(`/services/${serviceDetail.id}`);
  await page
    .getByRole('button', { name: uz.identity.continue, exact: true })
    .click();
  await page
    .getByRole('button', { name: uz.serviceFlow.manualTitle, exact: true })
    .click();
  await expect(page.locator('.identity-form')).toBeVisible();
}

async function expectGuide(
  page: Page,
  method: 'pinfl' | 'passport',
  copy = uz.identity,
) {
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.kiosk-route')).toHaveCSS('opacity', '1');
  const image = page.locator(`img[src$="identity-${method}-guide.png"]`);
  await expect(image).toHaveCount(1);
  await expect(image).toHaveJSProperty('complete', true);
  await expect
    .poll(() =>
      image.evaluate(
        (element) =>
          element instanceof HTMLImageElement && element.naturalWidth > 0,
      ),
    )
    .toBe(true);
  if ((page.viewportSize()?.width ?? 0) <= 720) {
    await expect(image).toBeHidden();
  } else {
    await expect(image).toBeVisible();
  }
  if (
    page.viewportSize()?.width === 1280 &&
    page.viewportSize()?.height === 800
  ) {
    const imageHeight = await image.evaluate(
      (element) => element.getBoundingClientRect().height,
    );
    console.log(`identity-guide ${method} MacBook image height ${imageHeight}`);
    expect
      .soft(imageHeight, `${method}: laptop guide remains readable`)
      .toBeGreaterThanOrEqual(180);
  }
  await expect(
    page.locator(
      `img[src$="identity-${method === 'pinfl' ? 'passport' : 'pinfl'}-guide.png"]`,
    ),
  ).toHaveCount(0);
  const figure = page.locator('figure').filter({ has: image });
  await expect(image).toHaveAttribute(
    'alt',
    method === 'pinfl' ? copy.pinGuideAlt : copy.passportGuideAlt,
  );
  await expect(figure.locator('h3')).toHaveText(
    method === 'pinfl' ? copy.pinGuideTitle : copy.passportGuideTitle,
  );
  await expect(figure.locator('figcaption')).toBeVisible();
  return figure.locator('figcaption p').allTextContents();
}

async function expectActionBelowKeyboard(page: Page) {
  const form = page.locator('.identity-form');
  const entry = form.locator('.identity-entry');
  await expect(entry.locator('.identity-continue')).toHaveAttribute(
    'type',
    'submit',
  );
  const geometry = await form.evaluate((element) => {
    const keyboard = element.querySelector('.identity-keyboard');
    const action = element.querySelector('.identity-continue');
    if (!keyboard || !action)
      throw new Error('Identity keyboard or action is missing');
    const keyboardBounds = keyboard.getBoundingClientRect();
    const actionBounds = action.getBoundingClientRect();
    return {
      keyboardBottom: keyboardBounds.bottom,
      actionTop: actionBounds.top,
    };
  });
  expect
    .soft(geometry.actionTop, 'Continue follows the keyboard')
    .toBeGreaterThanOrEqual(geometry.keyboardBottom - 1);
}

async function expectFit(
  page: Page,
  state: string,
  narrowAlphabetFallback = false,
) {
  const main = page.getByRole('main');
  const geometry = await main.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const actionBounds = element
      .querySelector('.identity-continue')
      ?.getBoundingClientRect();
    return {
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      documentWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      actionBottom: actionBounds?.bottom ?? null,
      mainBottom: bounds.bottom,
    };
  });
  console.log(`identity-guide ${state} ${JSON.stringify(geometry)}`);
  expect
    .soft(geometry.scrollWidth, `${state}: main horizontal overflow`)
    .toBeLessThanOrEqual(geometry.clientWidth + 1);
  expect
    .soft(
      geometry.documentScrollWidth,
      `${state}: document horizontal overflow`,
    )
    .toBeLessThanOrEqual(geometry.documentWidth + 1);
  if (!narrowAlphabetFallback) {
    expect
      .soft(geometry.scrollHeight, `${state}: main vertical overflow`)
      .toBeLessThanOrEqual(geometry.clientHeight + 1);
    expect
      .soft(geometry.actionBottom, `${state}: Continue stays above footer`)
      .toBeLessThanOrEqual(geometry.mainBottom + 1);
  } else {
    await expect(main).toHaveCSS('overflow-y', 'auto');
    const action = page.locator('.identity-continue');
    await action.scrollIntoViewIfNeeded();
    await expect(action).toBeInViewport();
    const bounds = await action.boundingBox();
    const mainBounds = await main.boundingBox();
    if (!bounds || !mainBounds) throw new Error('Missing narrow action bounds');
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(
      mainBounds.y + mainBounds.height + 1,
    );
  }
}

for (const viewport of viewports) {
  const fallback =
    viewport.width === 390 ? ' with reachable narrow passport fallback' : '';
  test(`identity guide and keyboard action fit ${viewport.width}x${viewport.height} ${viewport.theme}${fallback}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning')
        errors.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`);
    });
    await openIdentityForm(page, viewport.theme);
    const pinCaption = await expectGuide(page, 'pinfl');
    expect(pinCaption).toEqual([uz.identity.pinGuideCaption]);
    await expectActionBelowKeyboard(page);
    await expectFit(page, `${viewport.width}x${viewport.height} PINFL`);
    await page.screenshot({
      path: `output/playwright/identity-guide-pinfl-${viewport.width}x${viewport.height}-${viewport.theme}-${testInfo.project.name}.png`,
    });
    await page
      .getByRole('button', { name: uz.identity.passportMethod, exact: true })
      .click();
    const passportCaption = await expectGuide(page, 'passport');
    expect(passportCaption).toEqual([
      uz.identity.passportGuideDocument,
      uz.identity.passportGuideBirthDate,
    ]);
    expect(passportCaption).not.toEqual(pinCaption);
    await expectActionBelowKeyboard(page);
    await expectFit(
      page,
      `${viewport.width}x${viewport.height} passport`,
      viewport.width === 390,
    );
    await page.screenshot({
      path: `output/playwright/identity-guide-passport-${viewport.width}x${viewport.height}-${viewport.theme}-${testInfo.project.name}.png`,
    });
    await page
      .getByRole('button', { name: uz.identity.pinMethod, exact: true })
      .click();
    await expectGuide(page, 'pinfl');
    await expect(page.locator('#identity-pin')).toHaveValue('');
    expect.soft(errors).toEqual([]);
  });
}

test('guide captions render in all languages and Continue preserves form validation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  const identificationRequests: string[] = [];
  await page.route('**/api/v3/citizen/**', (route) => {
    identificationRequests.push(route.request().postData() ?? '');
    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(catalogEnvelope({ unknownField: 'qa-fixture' })),
    });
  });
  await openIdentityForm(page, 'dark');
  const captions = new Set<string>();
  for (const [language, copy] of [
    ['uz', uz],
    ['uzc', uzc],
    ['ru', ru],
    ['en', en],
  ] as const) {
    await page
      .locator('.footer-languages')
      .getByRole('button', { name: copy.languages[language], exact: true })
      .click();
    const pinCaption = await expectGuide(page, 'pinfl', copy.identity);
    expect(pinCaption).toEqual([copy.identity.pinGuideCaption]);
    captions.add(pinCaption.join('\n'));
    await page
      .getByRole('button', { name: copy.identity.passportMethod, exact: true })
      .click();
    const passportCaption = await expectGuide(page, 'passport', copy.identity);
    expect(passportCaption).toEqual([
      copy.identity.passportGuideDocument,
      copy.identity.passportGuideBirthDate,
    ]);
    captions.add(passportCaption.join('\n'));
    await page
      .getByRole('button', { name: copy.identity.pinMethod, exact: true })
      .click();
  }
  expect(captions.size).toBe(8);
  const action = page.locator('.identity-continue');
  await action.click();
  await expect(
    page.getByText(en.identity.pinError, { exact: true }),
  ).toBeVisible();
  await expect(page.locator('#identity-pin')).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await expectGuide(page, 'pinfl', en.identity);
  expect(identificationRequests).toEqual([]);
  await page.locator('#identity-pin').fill('12345678901234');
  await action.click();
  await expect(
    page.getByText(en.identity.receivedTitle, { exact: true }),
  ).toBeVisible();
  await expect(action).toBeEnabled();
  await page
    .getByRole('button', { name: en.identity.passportMethod, exact: true })
    .click();
  await expect(action).toBeEnabled();
  await page.locator('#identity-series').fill('AA');
  await page.locator('#identity-number').fill('1234567');
  await page.locator('#identity-birth-date').fill('12.03.1990');
  await action.click();
  await expect(
    page.getByText(en.identity.receivedTitle, { exact: true }),
  ).toBeVisible();
  await expect(action).toBeEnabled();
  expect(identificationRequests).toEqual([
    JSON.stringify({ pinfl: '12345678901234' }),
    JSON.stringify({ passportSerial: 'AA1234567', birthDate: '12.03.1990' }),
  ]);
});
