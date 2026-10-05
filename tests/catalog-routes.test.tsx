import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router';
import { AppProviders } from '@/app/providers/app-providers';
import { AppRouter } from '@/app/router/app-router';
import { useKioskSessionStore } from '@/features/kiosk-session';
import { i18n } from '@/shared/lib/i18n';
import type * as SharedApi from '@/shared/api';
import { catalogResponse, catalogServices } from './fixtures/service-catalog';

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
  vi.stubGlobal(
    'fetch',
    vi.fn((input: string | URL | Request) =>
      Promise.resolve(
        catalogResponse(
          new URL(
            input instanceof Request ? input.url : input.toString(),
            'http://localhost',
          ),
        ),
      ),
    ),
  );
});

function CurrentPath() {
  return <output data-testid="current-path">{useLocation().pathname}</output>;
}

function renderRoute(path: string) {
  render(
    <AppProviders>
      <MemoryRouter initialEntries={[path]}>
        <AppRouter />
        <CurrentPath />
      </MemoryRouter>
    </AppProviders>,
  );
}

const routes = [
  [7, 'residence'],
  [8, 'residents'],
  [12, 'criminal-record'],
  [22, 'release'],
] as const;

it.each(routes)(
  'opens service %s at its named %s route',
  async (number, slug) => {
    const service = catalogServices.find((item) => item.number === number);
    if (!service) throw new Error('Missing test service');
    const user = userEvent.setup();
    renderRoute('/home');
    await user.click(
      await screen.findByRole('button', { name: service.lang.en, exact: true }),
    );
    expect(
      await screen.findByRole('heading', { name: service.lang.en }),
    ).toBeVisible();
    expect(screen.getByTestId('current-path')).toHaveTextContent(
      `/services/${slug}`,
    );
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `/api/v3/services/${service.id}`,
      expect.objectContaining({ method: 'GET' }),
    );
  },
);

it.each(routes)(
  'resolves service %s from a fresh /services/%s URL',
  async (number, slug) => {
    const service = catalogServices.find((item) => item.number === number);
    if (!service) throw new Error('Missing test service');
    renderRoute(`/services/${slug}`);
    expect(
      await screen.findByRole('heading', { name: service.lang.en }),
    ).toBeVisible();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `/api/v3/services/${service.id}`,
      expect.objectContaining({ method: 'GET' }),
    );
  },
);
