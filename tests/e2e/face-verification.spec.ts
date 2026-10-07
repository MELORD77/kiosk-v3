import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import uz from '../../src/shared/lib/i18n/locales/uz.json' with { type: 'json' };
import uzc from '../../src/shared/lib/i18n/locales/uzc.json' with { type: 'json' };
import ru from '../../src/shared/lib/i18n/locales/ru.json' with { type: 'json' };
import en from '../../src/shared/lib/i18n/locales/en.json' with { type: 'json' };
import kk from '../../src/shared/lib/i18n/locales/kk.json' with { type: 'json' };
import { catalogEnvelope, serviceDetail } from '../fixtures/service-catalog';
import { routeCatalog } from './catalog-fixture';

const service = { ...serviceDetail, number: 7 };
const copies = { uz, uzc, ru, en, kk };

async function openVerification(
  page: Page,
  theme: string,
  language: keyof typeof copies = 'uz',
  cameraMode: 'missing' | 'empty' = 'missing',
) {
  const copy = copies[language];
  const requests: string[] = [];
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
  // Every API call is intercepted; identity data never reaches a real backend.
  await page.route(
    (url) => url.pathname.startsWith('/api/'),
    (route) => {
      requests.push(
        `${route.request().method()} ${new URL(route.request().url()).pathname}`,
      );
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(catalogEnvelope(null)),
      });
    },
  );
  await routeCatalog(page);
  await page.route(`**/api/v3/services/${service.id}`, (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(catalogEnvelope(service)),
    }),
  );
  await page.addInitScript(
    ({ theme, language, cameraMode }) => {
      localStorage.setItem('kiosk-language', language);
      localStorage.setItem('kiosk-theme', theme);
      localStorage.setItem('kiosk-orientation', 'auto');
      // Synthetic camera only; no physical webcam access or personal images.
      Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
        value: () => {
          if (cameraMode === 'missing')
            return Promise.reject(
              new DOMException('Synthetic camera unavailable', 'NotFoundError'),
            );
          const frame = document.createElement('canvas');
          frame.width = 1280;
          frame.height = 720;
          const context = frame.getContext('2d');
          if (!context) throw new Error('Synthetic camera unavailable');
          context.fillStyle = '#334155';
          context.fillRect(0, 0, frame.width, frame.height);
          return Promise.resolve(frame.captureStream(5));
        },
      });
    },
    { theme, language, cameraMode },
  );
  await page.goto(`/services/${service.id}`);
  await page
    .getByRole('button', { name: copy.identity.continue, exact: true })
    .click();
  await page
    .getByRole('button', { name: copy.serviceFlow.manualTitle, exact: true })
    .click();
  await submitIdentity(page, copy);
  return { requests, errors };
}

async function submitIdentity(page: Page, copy = uz) {
  await page.locator('#identity-series').fill('AA');
  await page.locator('#identity-number').fill('1234567');
  await page.locator('#identity-birth-date').fill('15041990');
  await page
    .getByRole('button', { name: copy.identity.continue, exact: true })
    .click();
  await expect(
    page.getByRole('heading', {
      name: copy.faceVerification.title,
      exact: true,
    }),
  ).toBeVisible();
}

async function expectFit(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  const overflow = await page.getByRole('main').evaluate((main) => {
    const bounds = main.getBoundingClientRect();
    return {
      horizontal:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
      clipped: Array.from(main.querySelectorAll('button'))
        .filter((button) => {
          const rect = button.getBoundingClientRect();
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            (rect.left < bounds.left - 1 ||
              rect.right > bounds.right + 1 ||
              rect.top < bounds.top - 1 ||
              rect.bottom > bounds.bottom + 1)
          );
        })
        .map((button) => button.textContent?.trim()),
    };
  });
  expect(overflow.horizontal, 'No horizontal overflow').toBe(false);
  if ((page.viewportSize()?.width ?? 1920) < 600) {
    for (const button of await page
      .getByRole('main')
      .getByRole('button')
      .all()) {
      await button.scrollIntoViewIfNeeded();
      const reachable = await button.evaluate((element) => {
        const bounds = element.closest('main')?.getBoundingClientRect();
        const rect = element.getBoundingClientRect();
        return (
          bounds &&
          rect.top >= bounds.top - 1 &&
          rect.bottom <= bounds.bottom + 1
        );
      });
      expect(reachable, 'Compact controls remain reachable by scrolling').toBe(
        true,
      );
    }
    await page.getByRole('main').evaluate((main) => {
      main.scrollTop = 0;
    });
    return;
  }
  expect(overflow.clipped, 'All face controls fit above the footer').toEqual(
    [],
  );
}

for (const theme of ['light', 'dark']) {
  test(`face verification gates service data and resets in ${theme}`, async ({
    page,
  }, testInfo) => {
    const { requests, errors } = await openVerification(page, theme);
    await expect(
      page.getByRole('heading', {
        name: uz.face.cameraUnavailable,
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: uz.face.start, exact: true }),
    ).toHaveCount(0);
    await expect(page.locator('video')).toHaveCount(0);
    expect(requests).toEqual([]);
    await expectFit(page);
    await page.screenshot({
      path: `output/playwright/face-auto-open-${theme}-${testInfo.project.name}.png`,
    });
    await page
      .getByRole('button', { name: uz.common.back, exact: true })
      .click();
    await expect(page.locator('#identity-number')).toHaveValue('1234567');
    await submitIdentity(page);
    expect(requests).toEqual([]);
    await page
      .getByRole('button', { name: uz.common.finish, exact: true })
      .click();
    await expect(
      page.getByRole('heading', {
        name: uz.faceVerification.title,
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(page.locator('video')).toHaveCount(0);
    expect(requests).toEqual([]);
    expect(errors, 'No console or network errors').toEqual([]);
  });
}

test('camera failure retries and cancels without submitting a photo or requesting service data', async ({
  page,
}, testInfo) => {
  const { requests, errors } = await openVerification(page, 'dark');
  const camera = page.getByRole('region', { name: uz.face.title, exact: true });
  await expect(
    camera.getByRole('heading', {
      name: uz.face.cameraUnavailable,
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    camera.getByRole('button', { name: uz.face.capture, exact: true }),
  ).toHaveCount(0);
  await expectFit(page);
  await page.screenshot({
    path: `output/playwright/face-camera-error-${testInfo.project.name}.png`,
  });
  await camera
    .getByRole('button', { name: uz.face.retry, exact: true })
    .click();
  await expect(
    camera.getByRole('heading', {
      name: uz.face.cameraUnavailable,
      exact: true,
    }),
  ).toBeVisible();
  await camera
    .getByRole('button', { name: uz.face.cancel, exact: true })
    .click();
  await expect(camera).toHaveCount(0);
  await expect(page.locator('#identity-number')).toHaveValue('1234567');
  expect(requests).toEqual([]);
  expect(
    errors,
    'Expected camera failure is handled without console errors',
  ).toEqual([]);
});

test('draws the camera overlay and waits when no face is detected', async ({
  page,
}, testInfo) => {
  const { requests, errors } = await openVerification(
    page,
    'dark',
    'uz',
    'empty',
  );
  const camera = page.getByRole('region', { name: uz.face.title, exact: true });
  await expect(camera.getByText(uz.face.noFace, { exact: true })).toBeVisible({
    timeout: 15_000,
  });
  await expect(camera.locator('canvas')).toBeVisible();
  await expect(camera.locator('video')).toBeVisible();
  const video = camera.locator('video');
  const geometry = await video.evaluate((element: HTMLVideoElement) => {
    const bounds = element.getBoundingClientRect();
    return {
      renderedRatio: bounds.width / bounds.height,
      sourceRatio: element.videoWidth / element.videoHeight,
      center: bounds.left + bounds.width / 2,
      viewportCenter: document.documentElement.clientWidth / 2,
    };
  });
  expect(geometry.renderedRatio).toBeCloseTo(
    Math.min(geometry.sourceRatio, 4 / 3),
    2,
  );
  expect(Math.abs(geometry.center - geometry.viewportCenter)).toBeLessThan(2);
  await expect(
    camera.getByRole('button', { name: uz.face.capture, exact: true }),
  ).toHaveCount(0);
  await expectFit(page);
  await page.screenshot({
    path: `output/playwright/face-auto-camera-${testInfo.project.name}.png`,
  });
  expect(requests).toEqual([]);
  await camera
    .getByRole('button', { name: uz.face.cancel, exact: true })
    .click();
  await expect(page.locator('video')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('face verification copy renders in all five languages', async ({
  context,
}) => {
  for (const [language, copy] of [
    ['uz', uz],
    ['uzc', uzc],
    ['ru', ru],
    ['en', en],
    ['kk', kk],
  ] as const) {
    const page = await context.newPage();
    const { requests, errors } = await openVerification(
      page,
      'light',
      language,
    );
    await expect(
      page.getByRole('heading', {
        name: copy.faceVerification.title,
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: copy.face.cameraUnavailable,
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: copy.face.start, exact: true }),
    ).toHaveCount(0);
    await expectFit(page);
    expect(requests).toEqual([]);
    expect(errors).toEqual([]);
    await page.close();
  }
});
