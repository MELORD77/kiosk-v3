import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { routeCatalog } from './catalog-fixture';

test.beforeEach(async ({ page }) => {
  await routeCatalog(page);
  await page.addInitScript(() => {
    localStorage.setItem('kiosk-language', 'en');
    localStorage.setItem('kiosk-theme', 'light');
    localStorage.setItem('kiosk-orientation', 'auto');
  });
});

async function openIdentity(page: Page) {
  await page.goto('/services/00000000-0000-4000-8000-000000000001');
  await expect(page.getByLabel('PINFL', { exact: true })).toBeVisible();
}

async function holdPointer(page: Page, button: Locator) {
  await button.scrollIntoViewIfNeeded();
  const bounds = await button.boundingBox();
  if (!bounds) throw new Error('Button geometry is unavailable');
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  );
  await page.mouse.down();
  return bounds;
}

async function opacity(button: Locator) {
  return button.evaluate((element) =>
    Number(getComputedStyle(element).opacity),
  );
}

test('press feedback changes only opacity and preserves native keyboard activation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openIdentity(page);
  const zero = page.getByRole('button', { name: '0', exact: true });
  const pin = page.getByLabel('PINFL', { exact: true });
  await expect(zero).toHaveCSS('opacity', '1');
  const before = await holdPointer(page, zero);
  await expect.poll(() => opacity(zero)).toBeLessThan(0.95);
  await expect(zero).toHaveCSS('transform', 'none');
  expect(await zero.boundingBox()).toEqual(before);
  await page.mouse.up();
  await expect(zero).toHaveCSS('opacity', '1');
  await expect(pin).toHaveValue('0');

  await zero.focus();
  for (const key of ['Space', 'Enter']) {
    await page.keyboard.down(key);
    await expect.poll(() => opacity(zero)).toBeLessThan(0.95);
    await page.keyboard.up(key);
    await expect(zero).toHaveCSS('opacity', '1');
  }
  await expect(pin).toHaveValue('000');
  await expect(page.locator('.field-error')).toHaveCount(0);
});

test('disabled feedback and session reset remain immediate', async ({
  page,
}) => {
  await openIdentity(page);
  await page.getByLabel('PINFL', { exact: true }).fill('00000000000000');
  const submit = page.getByRole('button', { name: 'Continue', exact: true });
  await submit.click();
  await expect(submit).toBeDisabled();
  await expect(submit).toHaveCSS('opacity', '0.55');
  await holdPointer(page, submit);
  await expect(submit).toHaveCSS('opacity', '0.55');
  await page.mouse.up();
  await page
    .getByRole('button', { name: 'Delete last character', exact: true })
    .click();
  await expect(submit).toBeEnabled();
  await expect(submit).toHaveCSS('opacity', '1');
  await expect(page.locator('.field-error')).toHaveCount(0);
  await page.getByRole('button', { name: 'Finish', exact: true }).click();
  await expect(page.getByLabel('PINFL', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: /English/ }).click();
  await page.locator('.service-card').first().click();
  await expect(page.getByLabel('PINFL', { exact: true })).toHaveValue('');
});

test('reduced motion disables press feedback on load and during a live preference change', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openIdentity(page);
  const zero = page.getByRole('button', { name: '0', exact: true });
  await holdPointer(page, zero);
  const samples = await zero.evaluate(async (element) => {
    const values: number[] = [];
    for (let frame = 0; frame < 12; frame += 1) {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      values.push(Number(getComputedStyle(element).opacity));
    }
    return values;
  });
  expect(samples.every((value) => value === 1)).toBe(true);
  await page.mouse.up();
  await expect(page.getByLabel('PINFL', { exact: true })).toHaveValue('0');

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await holdPointer(page, zero);
  await expect.poll(() => opacity(zero)).toBeLessThan(0.95);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(zero).toHaveCSS('opacity', '1');
  await page.mouse.up();
  await page.getByRole('button', { name: 'Passport', exact: true }).click();
  await expect(page.getByLabel('Passport series', { exact: true })).toHaveValue(
    '',
  );
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.locator('.field-error').first()).toHaveCSS('opacity', '1');
  await expect(page.locator('body')).toHaveJSProperty(
    'scrollWidth',
    await page.evaluate(() => document.documentElement.clientWidth),
  );
});
