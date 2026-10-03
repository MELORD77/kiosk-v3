import { expect, test } from '@playwright/test';
import { routeCatalog } from './catalog-fixture';

test.beforeEach(async ({ page }) => {
  await routeCatalog(page);
  await page.addInitScript(() => {
    if (!localStorage.getItem('kiosk-language'))
      localStorage.setItem('kiosk-language', 'en');
    if (!localStorage.getItem('kiosk-theme'))
      localStorage.setItem('kiosk-theme', 'light');
    if (!localStorage.getItem('kiosk-orientation'))
      localStorage.setItem('kiosk-orientation', 'auto');
  });
});

test('design welcome, categories, identity entry, and session reset', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('button', { name: /English/ })).toBeVisible();
  await page.getByRole('button', { name: /English/ }).click();
  await expect(
    page.getByRole('heading', { name: 'How can we help?' }),
  ).toBeVisible();
  await expect(
    page.getByText('Developer settings', { exact: true }),
  ).toHaveCount(0);
  await page.screenshot({
    path: `output/playwright/home-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await expect(page.locator('body')).toHaveJSProperty(
    'scrollWidth',
    await page.evaluate(() => document.documentElement.clientWidth),
  );
  await page
    .getByRole('button', { name: 'Protection order', exact: true })
    .click();
  await page
    .getByText(
      'Protection orders for women affected by harassment and violence',
      { exact: true },
    )
    .click();
  await expect(
    page.getByRole('button', { name: 'Passport', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Finish', exact: true }).click();
  await expect(page.getByRole('button', { name: /English/ })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Finish', exact: true }),
  ).toHaveCount(0);
  await page.screenshot({
    path: `output/playwright/welcome-${testInfo.project.name}.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test('demo query and form show success, empty, error, and retry', async ({
  page,
}) => {
  await page.goto('/core-demo');
  const label = page.getByRole('textbox', { name: 'Example label' });
  await expect(label).toBeVisible();
  await page.getByRole('button', { name: 'Check example' }).click();
  await expect(page.getByText('Enter a label', { exact: true })).toBeVisible();
  await label.fill('Portrait kiosk');
  await page.getByRole('button', { name: 'Check example' }).click();
  await expect(page.getByText('Example checked: Portrait kiosk')).toBeVisible();
  await label.fill('error');
  await page.getByRole('button', { name: 'Check example' }).click();
  await expect(
    page.getByText('The example could not be checked'),
  ).toBeVisible();
  await page
    .getByRole('combobox', { name: 'Data scenario' })
    .selectOption('empty');
  await expect(
    page.getByText('No profiles found', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('combobox', { name: 'Data scenario' })
    .selectOption('error');
  await expect(
    page.getByText('Demonstration error', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(
    page.getByText('Demonstration error', { exact: true }),
  ).toBeVisible();
});

test('theme controls apply and persist across refresh', async ({
  page,
}, testInfo) => {
  await page.goto('/home?devtools=1');
  await page.getByText('Developer settings', { exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Theme', exact: true })
    .selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({
    path: `output/playwright/home-dark-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByText('Developer settings', { exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Theme', exact: true })
    .selectOption('system');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
