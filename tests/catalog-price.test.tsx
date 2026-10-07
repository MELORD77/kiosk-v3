import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { AppProviders } from '@/app/providers/app-providers';
import { AppRouter } from '@/app/router/app-router';
import { useKioskSessionStore } from '@/features/kiosk-session';
import { i18n, toUzbekUiText } from '@/shared/lib/i18n';
import type { ServicePrice } from '@/entities/service-catalog';
import type * as SharedApi from '@/shared/api';
import { catalogEnvelope, serviceDetail } from './fixtures/service-catalog';

vi.mock('@/shared/api', async (importOriginal) => {
  const original = await importOriginal<typeof SharedApi>();
  return {
    ...original,
    apiClient: original.createApiClient({
      fetcher: (input, init) => globalThis.fetch(input, init),
    }),
  };
});

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
} satisfies ServicePrice;

beforeEach(async () => {
  useKioskSessionStore.getState().endSession();
  await i18n.changeLanguage('en');
});

function renderPrice(value: ServicePrice | null | undefined) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve(
        Response.json(catalogEnvelope({ ...serviceDetail, price: value })),
      ),
    ),
  );
  render(
    <AppProviders>
      <MemoryRouter initialEntries={[`/services/${serviceDetail.id}`]}>
        <AppRouter />
      </MemoryRouter>
    </AppProviders>,
  );
}

describe('structured service price', () => {
  it.each([
    ['uz', 'uz'],
    ['uzc', 'cr'],
    ['ru', 'ru'],
    ['en', 'en'],
  ] as const)(
    'displays backend amount and BHM text in %s without calculating a new price',
    async (locale, field) => {
      await i18n.changeLanguage(locale);
      renderPrice(price);
      await screen.findByRole('button', {
        name: i18n.t('identity.continue'),
        exact: true,
      });
      const expectedPrice = `${price.text[field]} (${price.bhmText[field]})`;
      expect(
        screen.getByText(
          locale === 'uz' ? toUzbekUiText(expectedPrice) : expectedPrice,
          {
            exact: true,
          },
        ),
      ).toBeInTheDocument();
    },
  );

  it.each(['uz', 'uzc', 'ru', 'en'])(
    'uses the free flag in %s even when a nonzero amount is supplied',
    async (locale) => {
      await i18n.changeLanguage(locale);
      renderPrice({ ...price, isFree: true, bhmText: null });
      await screen.findByRole('button', {
        name: i18n.t('identity.continue'),
        exact: true,
      });
      await waitFor(() =>
        expect(
          screen.getByText(i18n.t('serviceFlow.free'), { exact: true }),
        ).toBeVisible(),
      );
      expect(screen.queryByText(/11.?880/)).not.toBeInTheDocument();
    },
  );

  it.each([null, undefined])(
    'keeps missing price unavailable: %s',
    async (value) => {
      renderPrice(value);
      await screen.findByRole('button', { name: 'Continue', exact: true });
      expect(
        screen.getAllByText(i18n.t('serviceFlow.notProvided')),
      ).toHaveLength(3);
      expect(
        screen.queryByText(i18n.t('serviceFlow.free')),
      ).not.toBeInTheDocument();
    },
  );

  it('does not add empty parentheses when only the amount text is provided', async () => {
    renderPrice({ ...price, bhmText: { uz: '', cr: '', ru: '', en: '   ' } });
    await screen.findByRole('button', { name: 'Continue', exact: true });
    expect(
      screen.getByText(price.text.en, { exact: true }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/\(\s*\)/)).not.toBeInTheDocument();
  });

  it('displays paid amount text when the backend returns null BHM text', async () => {
    renderPrice({ ...price, bhmText: null });
    await screen.findByRole('button', { name: 'Continue', exact: true });
    expect(
      screen.getByText(price.text.en, { exact: true }),
    ).toBeInTheDocument();
  });
});
