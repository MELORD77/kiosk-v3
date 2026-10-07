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

async function openChoice(page: Page, theme: string) {
  const unexpectedRequests: string[] = [];
  await page.route('**/*', (route) => {
    const request = route.request();
    if (['fetch', 'xhr'].includes(request.resourceType())) {
      unexpectedRequests.push(`${request.method()} ${request.url()}`);
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      });
    }
    return route.continue();
  });
  await routeCatalog(page);
  await page.route(`**/api/v3/services/${serviceDetail.id}`, (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(catalogEnvelope(serviceDetail)),
    }),
  );
  await page.addInitScript(
    ({ theme }) => {
      localStorage.setItem('kiosk-language', 'uz');
      localStorage.setItem('kiosk-theme', theme);
      localStorage.setItem('kiosk-orientation', 'auto');
    },
    { theme },
  );
  await page.goto(`/services/${serviceDetail.id}`);
  await page
    .getByRole('button', { name: uz.identity.continue, exact: true })
    .click();
  await expect(page.locator('.identity-method-choice')).toBeVisible();
  return unexpectedRequests;
}

async function expectFit(page: Page, state: string) {
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.kiosk-route')).toHaveCSS('opacity', '1');
  const geometry = await page.getByRole('main').evaluate((main) => {
    const bounds = main.getBoundingClientRect();
    return {
      height: main.clientHeight,
      scrollHeight: main.scrollHeight,
      width: main.clientWidth,
      scrollWidth: main.scrollWidth,
      documentWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      clippedControls: Array.from(main.querySelectorAll('button,input'))
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            (rect.top < bounds.top - 1 ||
              rect.bottom > bounds.bottom + 1 ||
              rect.left < bounds.left - 1 ||
              rect.right > bounds.right + 1)
          );
        })
        .map((element) => element.textContent?.trim() || element.id),
    };
  });
  console.log(`id-card ${state} ${JSON.stringify(geometry)}`);
  expect
    .soft(geometry.scrollHeight, `${state}: vertical fit`)
    .toBeLessThanOrEqual(geometry.height + 1);
  expect
    .soft(geometry.scrollWidth, `${state}: horizontal fit`)
    .toBeLessThanOrEqual(geometry.width + 1);
  expect
    .soft(geometry.documentScrollWidth)
    .toBeLessThanOrEqual(geometry.documentWidth + 1);
  expect
    .soft(geometry.clippedControls, `${state}: controls remain above footer`)
    .toEqual([]);
}

async function expectChoice(page: Page, copy = uz) {
  const grid = page.locator('.identity-method-grid');
  await expect(grid.getByRole('button')).toHaveCount(3);
  for (const method of ['manual', 'reader', 'idCard'] as const) {
    const card = grid.getByRole('button', {
      name: copy.serviceFlow[`${method}Title`],
      exact: true,
    });
    await expect(card).toBeEnabled();
    await expect(card.locator('.service-method-description')).toHaveText(
      copy.serviceFlow[`${method}Description`],
    );
  }
  await expect(
    grid.getByText(copy.serviceFlow.comingSoon, { exact: true }),
  ).toBeVisible();
  await expectFit(page, 'method choice');
  const viewport = page.viewportSize();
  if (viewport && viewport.width > viewport.height) {
    const cards = await grid.getByRole('button').evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width };
      }),
    );
    for (const card of cards.slice(1)) {
      expect(Math.abs(card.y - cards[0].y)).toBeLessThanOrEqual(1);
      expect(Math.abs(card.width - cards[0].width)).toBeLessThanOrEqual(1);
    }
    expect(cards[1].x).toBeGreaterThan(cards[0].x + cards[0].width);
    expect(cards[2].x).toBeGreaterThan(cards[1].x + cards[1].width);
  }
}

async function expectIdCard(page: Page, copy = uz) {
  const screen = page.locator('.id-card-reader-screen');
  await expect(
    screen.getByRole('heading', {
      name: copy.serviceFlow.idCardTitle,
      exact: true,
    }),
  ).toBeVisible();
  for (const text of [
    copy.serviceFlow.idCardInstruction,
    copy.serviceFlow.idCardUnavailableTitle,
    copy.serviceFlow.idCardUnavailableDescription,
    copy.serviceFlow.idCardSample,
  ]) {
    await expect(screen.getByText(text, { exact: true })).toBeVisible();
  }
  const image = screen.locator('img');
  await expect(image).toHaveJSProperty('complete', true);
  await expect
    .poll(() =>
      image.evaluate(
        (element) =>
          element instanceof HTMLImageElement && element.naturalWidth > 0,
      ),
    )
    .toBe(true);
  await expect(
    screen.getByRole('button', {
      name: copy.serviceFlow.idCardRead,
      exact: true,
    }),
  ).toBeDisabled();
  await expect(
    screen.getByRole('button', {
      name: copy.serviceFlow.manualTitle,
      exact: true,
    }),
  ).toBeEnabled();
  await expectFit(page, 'ID card unavailable');
}

for (const viewport of viewports) {
  test(`three identity cards and unavailable NFC fit ${viewport.width}x${viewport.height} ${viewport.theme}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (['error', 'warning'].includes(message.type()))
        errors.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`);
    });
    const requests = await openChoice(page, viewport.theme);
    await expectChoice(page);
    await page.screenshot({
      path: `output/playwright/id-card-choice-${viewport.width}x${viewport.height}-${viewport.theme}.png`,
    });
    await page
      .getByRole('button', { name: uz.serviceFlow.idCardTitle, exact: true })
      .click();
    await expectIdCard(page);
    expect(requests).toEqual([]);
    await page.screenshot({
      path: `output/playwright/id-card-reader-${viewport.width}x${viewport.height}-${viewport.theme}.png`,
    });
    await page
      .getByRole('button', { name: uz.common.back, exact: true })
      .click();
    await expectChoice(page);
    await page
      .getByRole('button', { name: uz.serviceFlow.idCardTitle, exact: true })
      .click();
    await page
      .getByRole('button', { name: uz.serviceFlow.manualTitle, exact: true })
      .click();
    await expect(page.locator('.identity-form')).toBeVisible();
    await expect(page.locator('#identity-pin')).toHaveValue('');
    await expectFit(page, 'ID card manual fallback');
    await page
      .getByRole('button', { name: uz.common.back, exact: true })
      .click();
    await page
      .getByRole('button', { name: uz.serviceFlow.readerTitle, exact: true })
      .click();
    await expect(
      page.getByRole('heading', { name: uz.passportReader.title, exact: true }),
    ).toBeVisible();
    await expect(page.locator('.id-card-reader-screen')).toHaveCount(0);
    const passportImage = page.locator('main img');
    await expect(passportImage).toHaveJSProperty('complete', true);
    await expect
      .poll(() =>
        passportImage.evaluate(
          (element) =>
            element instanceof HTMLImageElement && element.naturalWidth > 0,
        ),
      )
      .toBe(true);
    await expectFit(page, 'independent passport reader');
    await page
      .getByRole('button', { name: uz.common.back, exact: true })
      .click();
    await expectChoice(page);
    expect(requests, 'No citizen or hardware requests from navigation').toEqual(
      [],
    );
    expect(errors, 'No console or network failures').toEqual([]);
  });
}

test('ID card labels and unavailable instructions render in all four locales', async ({
  page,
}) => {
  await page.setViewportSize({ width: 800, height: 600 });
  const requests = await openChoice(page, 'dark');
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
    await expectChoice(page, copy);
    await page
      .getByRole('button', { name: copy.serviceFlow.idCardTitle, exact: true })
      .click();
    await expectIdCard(page, copy);
    await page
      .getByRole('button', { name: copy.common.back, exact: true })
      .click();
  }
  expect(requests).toEqual([]);
});
