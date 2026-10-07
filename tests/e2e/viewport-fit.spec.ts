import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import uz from '../../src/shared/lib/i18n/locales/uz.json' with { type: 'json' };
import uzc from '../../src/shared/lib/i18n/locales/uzc.json' with { type: 'json' };
import ru from '../../src/shared/lib/i18n/locales/ru.json' with { type: 'json' };
import en from '../../src/shared/lib/i18n/locales/en.json' with { type: 'json' };
import kk from '../../src/shared/lib/i18n/locales/kk.json' with { type: 'json' };
import { catalogEnvelope, serviceDetail } from '../fixtures/service-catalog';
import { routeCatalog } from './catalog-fixture';

const viewports = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1024, height: 600 },
  { width: 800, height: 600 },
  { width: 1080, height: 1920 },
  { width: 720, height: 1280 },
  { width: 390, height: 844 },
];
const locales = { uz, uzc, ru, en, kk };

for (const theme of ['light', 'dark']) {
  test(`Karakalpak selection and footer switching render translated catalog in ${theme}`, async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    const networkErrors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning')
        errors.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400)
        networkErrors.push(`${response.status()} ${response.url()}`);
    });
    await page.addInitScript(
      ({ theme }) => {
        localStorage.setItem('kiosk-language', 'uz');
        localStorage.setItem('kiosk-theme', theme);
        localStorage.setItem('kiosk-orientation', 'auto');
      },
      { theme },
    );
    await routeCatalog(page);
    await page.goto('/');
    await expect(page.locator('.language-card')).toHaveCount(5);
    await expectViewportFit(page, 'five-language welcome');
    await page.screenshot({
      path: `output/playwright/five-language-welcome-${theme}-${testInfo.project.name}.png`,
    });
    await page
      .getByRole('button', { name: kk.languages.kk, exact: true })
      .click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'kaa-Latn');
    await expect(
      page.getByRole('heading', { name: kk.home.title }),
    ).toBeVisible();
    const footer = page.locator('footer');
    await expect(footer.locator('.footer-languages button')).toHaveCount(5);
    for (const button of await footer.getByRole('button').all()) {
      await expect(button).toBeInViewport();
    }
    await footer
      .getByRole('button', { name: kk.languages.uz, exact: true })
      .click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'uz-Latn');
    await expect(
      page.getByRole('heading', { name: uz.home.title }),
    ).toBeVisible();
    await footer
      .getByRole('button', { name: uz.languages.kk, exact: true })
      .click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'kaa-Latn');
    await page
      .getByRole('button', { name: kk.categories.reg, exact: true })
      .click();
    await expect(
      page.getByText(kk.services['service-7'], { exact: true }),
    ).toBeVisible();
    await page.screenshot({
      path: `output/playwright/karakalpak-catalog-${theme}-${testInfo.project.name}.png`,
      fullPage: true,
    });
    expect(errors).toEqual([]);
    expect(networkErrors).toEqual([]);
  });
}

async function expectViewportFit(page: Page, state: string) {
  const main = page.getByRole('main');
  await expect.soft(main).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.kiosk-route')).toHaveCSS('opacity', '1');
  const readerImage = main.locator('img[src$="/images/passport-reader.png"]');
  if (await readerImage.count()) {
    await expect(readerImage).toHaveJSProperty('complete', true);
    await expect
      .poll(() =>
        readerImage.evaluate(
          (element) =>
            element instanceof HTMLImageElement && element.naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
  await expect
    .soft(async () => {
      const geometry = await main.evaluate((element) => ({
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        documentWidth: document.documentElement.clientWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        documentHeight: document.documentElement.clientHeight,
        documentScrollHeight: document.documentElement.scrollHeight,
      }));
      expect(
        geometry.scrollHeight,
        `${state}: main vertical overflow`,
      ).toBeLessThanOrEqual(geometry.clientHeight + 1);
      expect(
        geometry.scrollWidth,
        `${state}: main horizontal overflow`,
      ).toBeLessThanOrEqual(geometry.clientWidth + 1);
      expect(
        geometry.documentScrollWidth,
        `${state}: document horizontal overflow`,
      ).toBeLessThanOrEqual(geometry.documentWidth + 1);
      expect(
        geometry.documentScrollHeight,
        `${state}: document vertical overflow`,
      ).toBeLessThanOrEqual(geometry.documentHeight + 1);
    })
    .toPass({ timeout: 2000 });
  // A clipped scroll container must not hide any interactive controls.
  const clippedControls = await main.evaluate((element) => {
    const mainBounds = element.getBoundingClientRect();
    return Array.from(element.querySelectorAll('button, input')).flatMap(
      (control) => {
        const bounds = control.getBoundingClientRect();
        const style = getComputedStyle(control);
        if (
          !bounds.width ||
          !bounds.height ||
          style.visibility === 'hidden' ||
          style.visibility === 'collapse'
        )
          return [];
        if (
          bounds.y >= mainBounds.y - 1 &&
          bounds.bottom <= mainBounds.bottom + 1
        )
          return [];
        const label =
          control.getAttribute('aria-label') || control.textContent || 'input';
        return [
          `${label}: ${Math.round(bounds.y)}-${Math.round(bounds.bottom)}`,
        ];
      },
    );
  });
  expect.soft(clippedControls, `${state}: controls outside main`).toEqual([]);
}

async function expectNarrowKeyboardFallback(page: Page) {
  const main = page.getByRole('main');
  await expect(main).toHaveCSS('overflow-y', 'auto');
  const controls = [
    page.locator('.identity-keyboard [data-skbtn="Q"]'),
    page.locator('.identity-keyboard [data-skbtn="{space}"]'),
    page.locator('.identity-continue'),
  ];
  for (const control of controls) {
    await control.scrollIntoViewIfNeeded();
    await expect(control).toBeInViewport();
    const bounds = await control.boundingBox();
    const mainBounds = await main.boundingBox();
    if (!bounds || !mainBounds)
      throw new Error('Missing narrow keyboard control bounds');
    expect(bounds.y).toBeGreaterThanOrEqual(mainBounds.y - 1);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(
      mainBounds.y + mainBounds.height + 1,
    );
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
}

for (const viewport of viewports) {
  for (const theme of ['light', 'dark']) {
    const fallback =
      viewport.width === 390
        ? ' with reachable narrow alphabet keyboard fallback'
        : '';
    test(`non-list pages fit ${viewport.width}x${viewport.height} in ${theme}${fallback}`, async ({
      page,
    }, testInfo) => {
      async function captureFullHdState(state: string) {
        if (viewport.width !== 1920 && viewport.height !== 1920) return;
        const stage =
          process.env.KIOSK_QA_STAGE === 'before' ? 'before' : 'final';
        const name = `viewport-fit-${stage}-${state}-${viewport.width}x${viewport.height}-${theme}-${testInfo.project.name}`;
        await page.screenshot({ path: `output/playwright/${name}.png` });
        const geometry = await page.getByRole('main').evaluate((main) => {
          const mainBounds = main.getBoundingClientRect();
          const footer = document.querySelector('footer');
          const footerTop = footer?.getBoundingClientRect().top ?? null;
          const action = main.querySelector(
            '.identity-continue, .service-flow > div:last-child .button--primary',
          );
          const actionBounds = action?.getBoundingClientRect();
          return {
            mainHeight: main.clientHeight,
            mainScrollHeight: main.scrollHeight,
            mainBottom: mainBounds.bottom,
            footerTop,
            actionBottom: actionBounds?.bottom ?? null,
            actionFooterGap:
              footerTop !== null && actionBounds
                ? footerTop - actionBounds.bottom
                : null,
          };
        });
        await testInfo.attach(`${name}-geometry`, {
          body: JSON.stringify(geometry),
          contentType: 'application/json',
        });
        console.log(`${name} ${JSON.stringify(geometry)}`);
        if (
          stage === 'final' &&
          (state === 'overview' ||
            (viewport.height === 1920 &&
              (state === 'pinfl' || state === 'passport')))
        ) {
          expect
            .soft(geometry.actionFooterGap, `${state}: action has a footer gap`)
            .not.toBeNull();
          expect
            .soft(
              geometry.actionFooterGap,
              `${state}: action stays above footer`,
            )
            .toBeGreaterThanOrEqual(-1);
          expect
            .soft(
              geometry.actionFooterGap,
              `${state}: action stays close to footer`,
            )
            .toBeLessThanOrEqual(33);
        }
      }
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.addInitScript(
        ({ theme }) => {
          localStorage.setItem('kiosk-language', 'uz');
          localStorage.setItem('kiosk-theme', theme);
          localStorage.setItem('kiosk-orientation', 'auto');
        },
        { theme },
      );
      const errors: string[] = [];
      const networkErrors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error' || message.type() === 'warning')
          errors.push(message.text());
      });
      page.on('response', (response) => {
        if (response.status() >= 400)
          networkErrors.push(`${response.status()} ${response.url()}`);
      });
      await routeCatalog(page);
      await page.route(`**/api/v3/services/${serviceDetail.id}`, (route) =>
        route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify(catalogEnvelope(serviceDetail)),
        }),
      );
      await page.goto('/');
      await expect.soft(page.locator('.language-card')).toHaveCount(5);
      await expectViewportFit(page, 'welcome');
      await captureFullHdState('welcome');
      await page.goto('/?skeleton=1');
      await expect.soft(page.locator('.welcome-page')).toBeVisible();
      await expectViewportFit(page, 'welcome skeleton');
      await page.goto(`/services/${serviceDetail.id}?skeleton=1`);
      await expect.soft(page.locator('.identity-page')).toBeVisible();
      await expectViewportFit(page, 'overview skeleton');
      await page.goto(`/services/${serviceDetail.id}`);
      const continueButton = page.getByRole('button', {
        name: uz.identity.continue,
        exact: true,
      });
      await expect.soft(continueButton).toBeVisible();
      await expectViewportFit(page, 'overview');
      await captureFullHdState('overview');
      if (viewport.width === 800 || viewport.width === 390) {
        await page.screenshot({
          path: `output/playwright/viewport-fit-overview-${viewport.width}-${theme}-${testInfo.project.name}.png`,
        });
      }
      await continueButton.click();
      await expect
        .soft(
          page.getByRole('button', {
            name: uz.serviceFlow.manualTitle,
            exact: true,
          }),
        )
        .toBeVisible();
      await expectViewportFit(page, 'identity method');
      await captureFullHdState('method');
      await page
        .getByRole('button', { name: uz.serviceFlow.manualTitle, exact: true })
        .click();
      await expect.soft(page.locator('.identity-form')).toBeVisible();
      await expectViewportFit(page, 'manual PINFL');
      await captureFullHdState('pinfl');
      await page
        .getByRole('button', { name: uz.identity.passportMethod, exact: true })
        .click();
      await expect.soft(page.locator('.identity-keyboard')).toBeVisible();
      if (viewport.width === 390) {
        await expectNarrowKeyboardFallback(page);
      } else {
        await expectViewportFit(page, 'manual passport alphabet');
      }
      await captureFullHdState('passport');
      if (viewport.width === 800 || viewport.width === 390) {
        await page.screenshot({
          path: `output/playwright/viewport-fit-passport-${viewport.width}-${theme}-${testInfo.project.name}.png`,
        });
      }
      await page
        .getByRole('button', { name: uz.common.back, exact: true })
        .click();
      await page
        .getByRole('button', { name: uz.serviceFlow.readerTitle, exact: true })
        .click();
      await expect
        .soft(
          page.getByRole('heading', {
            name: uz.passportReader.title,
            exact: true,
          }),
        )
        .toBeVisible();
      await expectViewportFit(page, 'reader idle');
      await expect(
        page.getByRole('button', {
          name: uz.serviceFlow.startReading,
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', {
          name: uz.serviceFlow.manualTitle,
          exact: true,
        }),
      ).toBeVisible();
      await captureFullHdState('reader');
      if (viewport.width === 800 || viewport.width === 390) {
        await page.screenshot({
          path: `output/playwright/viewport-fit-reader-${viewport.width}-${theme}-${testInfo.project.name}.png`,
        });
      }
      expect.soft(errors).toEqual([]);
      expect.soft(networkErrors).toEqual([]);
    });
  }
}

for (const language of ['uzc', 'ru', 'en', 'kk'] as const) {
  test(`translated overview and manual entry fit a short kiosk in ${language}`, async ({
    page,
  }) => {
    const copy = locales[language];
    await page.setViewportSize({ width: 800, height: 600 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.addInitScript(
      ({ language }) => {
        localStorage.setItem('kiosk-language', language);
        localStorage.setItem('kiosk-theme', 'dark');
        localStorage.setItem('kiosk-orientation', 'auto');
      },
      { language },
    );
    await routeCatalog(page);
    await page.route(`**/api/v3/services/${serviceDetail.id}`, (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(catalogEnvelope(serviceDetail)),
      }),
    );
    await page.goto(`/services/${serviceDetail.id}`);
    await expect
      .soft(
        page.getByRole('button', {
          name: copy.identity.continue,
          exact: true,
        }),
      )
      .toBeVisible();
    await expectViewportFit(page, `${language} overview`);
    await page
      .getByRole('button', { name: copy.identity.continue, exact: true })
      .click();
    await expectViewportFit(page, `${language} methods`);
    await page
      .getByRole('button', { name: copy.serviceFlow.manualTitle, exact: true })
      .click();
    await expect.soft(page.locator('.identity-form')).toBeVisible();
    await expectViewportFit(page, `${language} manual PINFL`);
    await page
      .getByRole('button', { name: copy.identity.passportMethod, exact: true })
      .click();
    await expectViewportFit(page, `${language} manual passport`);
    await page
      .getByRole('button', { name: copy.common.back, exact: true })
      .click();
    await page
      .getByRole('button', { name: copy.serviceFlow.readerTitle, exact: true })
      .click();
    await expect(
      page.getByRole('heading', {
        name: copy.passportReader.title,
        exact: true,
      }),
    ).toBeVisible();
    await expectViewportFit(page, `${language} reader idle`);
    await page.screenshot({
      path: `output/playwright/viewport-fit-reader-800-${language}-dark.png`,
    });
  });
}
