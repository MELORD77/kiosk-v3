import { expect, test } from '@playwright/test';
import { routeCatalog } from './catalog-fixture';

test.beforeEach(async ({ page }) => {
  await routeCatalog(page);
  await page.addInitScript(() => {
    localStorage.setItem('kiosk-language', 'en');
    localStorage.setItem('kiosk-theme', 'light');
    localStorage.setItem('kiosk-orientation', 'auto');
  });
});

test('idle dialog traps focus, resumes without losing input, and ends the session', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.clock.install();
  await page.goto('/core-demo');
  const input = page.getByRole('textbox', { name: 'Example label' });
  await input.fill('Keep this input');
  await page.clock.fastForward(121_000);
  const dialog = page.getByRole('alertdialog', {
    name: 'Are you still there?',
  });
  await expect(dialog).toBeVisible();
  const continueButton = dialog.getByRole('button', { name: 'Continue' });
  const finishButton = dialog.getByRole('button', { name: 'Finish' });
  await expect(continueButton).toBeFocused();
  const dialogBounds = await dialog.boundingBox();
  const viewport = page.viewportSize();
  if (!dialogBounds || !viewport)
    throw new Error('Dialog geometry is unavailable');
  expect(
    Math.abs(dialogBounds.x + dialogBounds.width / 2 - viewport.width / 2),
  ).toBeLessThanOrEqual(1);
  expect(
    Math.abs(dialogBounds.y + dialogBounds.height / 2 - viewport.height / 2),
  ).toBeLessThanOrEqual(1);
  await page.keyboard.press('Tab');
  await expect(finishButton).toBeFocused();
  await page.keyboard.press('Tab');
  // Chromium can visit browser chrome between the last and first modal control.
  if (
    !(await continueButton.evaluate(
      (element) => element === document.activeElement,
    ))
  ) {
    expect(
      await page.evaluate(() => document.activeElement === document.body),
    ).toBe(true);
    await page.keyboard.press('Tab');
  }
  await expect(continueButton).toBeFocused();
  await page.screenshot({
    path: `output/playwright/dialog-${testInfo.project.name}.png`,
  });
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(input).toHaveValue('Keep this input');
  await expect(input).toBeFocused();
  await page.clock.fastForward(121_000);
  await expect(dialog).toBeVisible();
  await finishButton.click();
  await expect(page.getByRole('button', { name: /English/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Finish' })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('the service list remains keyboard-scrollable in both themes', async ({
  page,
}, testInfo) => {
  await page.goto('/home?devtools=1');
  const scrollContainer = page.locator(
    testInfo.project.name === 'compact' ? '.kiosk-main' : '.service-grid',
  );
  const lastService = page.getByText(
    'Notice of starting or ending installation, setup, repair and maintenance of security systems',
    { exact: true },
  );
  if (testInfo.project.name === 'compact') {
    await page
      .getByRole('button', { name: 'All services', exact: true })
      .hover();
    await page.mouse.wheel(0, 400);
    await expect
      .poll(() => scrollContainer.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    await page.locator('.service-card').first().hover();
    const previousScrollTop = await scrollContainer.evaluate(
      (element) => element.scrollTop,
    );
    await page.mouse.wheel(0, 400);
    await expect
      .poll(() => scrollContainer.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(previousScrollTop);
  }
  for (const theme of ['light', 'dark']) {
    await page.getByText('Developer settings', { exact: true }).click();
    await page
      .getByRole('combobox', { name: 'Theme', exact: true })
      .selectOption(theme);
    await page.getByText('Developer settings', { exact: true }).click();
    await scrollContainer.focus();
    await page.keyboard.press('End');
    await expect(lastService).toBeInViewport();
    await expect(page.locator('body')).toHaveJSProperty(
      'scrollWidth',
      await page.evaluate(() => document.documentElement.clientWidth),
    );
    await page.screenshot({
      path: `output/playwright/scroll-${theme}-${testInfo.project.name}.png`,
    });
  }
  await lastService.click();
  await expect(
    page.getByRole('button', { name: 'Passport', exact: true }),
  ).toBeVisible();
});
