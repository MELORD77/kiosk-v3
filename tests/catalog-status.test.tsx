import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { AppProviders } from '@/app/providers/app-providers';
import { AppRouter } from '@/app/router/app-router';
import { useKioskSessionStore } from '@/features/kiosk-session';
import { i18n } from '@/shared/lib/i18n';
import type * as SharedApi from '@/shared/api';
import {
  catalogEnvelope,
  catalogResponse,
  catalogServices,
  serviceDetail,
} from './fixtures/service-catalog';

vi.mock('@/shared/api', async (importOriginal) => {
  const original = await importOriginal<typeof SharedApi>();
  return {
    ...original,
    apiClient: original.createApiClient({
      fetcher: (input, init) => globalThis.fetch(input, init),
    }),
  };
});

beforeEach(async () => {
  useKioskSessionStore.getState().endSession();
  await i18n.changeLanguage('en');
});

function renderRoute(path: string) {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[path]}>
        <AppRouter />
      </MemoryRouter>
    </AppProviders>,
  );
}

describe('catalog availability', () => {
  it('disables unavailable cards using backend status while allowing active services', async () => {
    const services = catalogServices.slice(0, 3).map((service, index) => ({
      ...service,
      status: ['ACTIVE', 'IN_PROGRESS', 'MAINTENANCE'][index],
      lang: { ...service.lang, en: `Status service ${index}` },
    }));
    const fetcher = vi.fn((input: string | URL | Request) => {
      const url = new URL(
        input instanceof Request ? input.url : input.toString(),
        'http://localhost',
      );
      return Promise.resolve(
        url.pathname === '/api/v3/services'
          ? Response.json(catalogEnvelope(services))
          : catalogResponse(url),
      );
    });
    vi.stubGlobal('fetch', fetcher);
    renderRoute('/home');
    const active = await screen.findByRole('button', {
      name: /Status service 0/,
    });
    expect(active).toBeEnabled();
    for (const index of [1, 2]) {
      const card = screen.getByRole('button', {
        name: new RegExp(`Status service ${index}`),
      });
      expect(card).toBeDisabled();
      await userEvent.click(card);
    }
    expect(
      fetcher.mock.calls.some(([input]) =>
        String(input).includes(`/services/${services[1]?.id}`),
      ),
    ).toBe(false);
    expect(screen.queryByText('About this service')).not.toBeInTheDocument();
    await userEvent.click(active);
    expect(await screen.findByText('About this service')).toBeVisible();
  });

  it.each(['IN_PROGRESS', 'MAINTENANCE'])(
    'blocks a direct URL for %s without showing identity controls',
    async (status) => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() =>
          Promise.resolve(
            Response.json(catalogEnvelope({ ...serviceDetail, status })),
          ),
        ),
      );
      renderRoute(`/services/${serviceDetail.id}`);
      await waitFor(() => {
        expect(
          screen.getByText(i18n.t(`serviceStatus.${status}`)),
        ).toBeVisible();
      });
      expect(
        screen.queryByRole('button', { name: 'Continue', exact: true }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText('PINFL', { exact: true }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Home', exact: true }),
      ).toBeEnabled();
    },
  );

  it('renders supplied requirements in each locale', async () => {
    const documents = {
      uz: 'Pasport nusxasi',
      cr: 'Паспорт нусхаси',
      ru: 'Копия паспорта',
      en: 'Passport copy',
    };
    const verification = {
      uz: 'Shaxsni tekshirish',
      cr: 'Шахсни текшириш',
      ru: 'Проверка личности',
      en: 'Identity check',
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          Response.json(
            catalogEnvelope({
              ...serviceDetail,
              status: 'ACTIVE',
              documents,
              verification,
            }),
          ),
        ),
      ),
    );
    renderRoute(`/services/${serviceDetail.id}`);
    expect(await screen.findByText(documents.en)).toBeVisible();
    for (const [language, backendLanguage] of [
      ['uz', 'uz'],
      ['uzc', 'cr'],
      ['ru', 'ru'],
      ['en', 'en'],
    ] as const) {
      await act(async () => {
        await i18n.changeLanguage(language);
      });
      expect(screen.getByText(documents[backendLanguage])).toBeVisible();
      expect(screen.getByText(verification[backendLanguage])).toBeVisible();
    }
  });

  it('uses the unavailable fallback for null and blank requirements', async () => {
    const documents = { uz: '', cr: '', ru: '', en: ' \n ' };
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          Response.json(
            catalogEnvelope({
              ...serviceDetail,
              status: 'ACTIVE',
              documents,
              verification: null,
            }),
          ),
        ),
      ),
    );
    renderRoute(`/services/${serviceDetail.id}`);
    await screen.findByRole('button', { name: 'Continue', exact: true });
    const fallback = await screen.findAllByText(
      i18n.t('serviceFlow.notProvided'),
    );
    expect(fallback).toHaveLength(2);
  });
});
