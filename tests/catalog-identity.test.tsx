import { act, render, screen } from '@testing-library/react';
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
  vi.stubGlobal(
    'fetch',
    vi.fn((input: string | URL | Request) => {
      const url = new URL(
        input instanceof Request ? input.url : input.toString(),
        'http://localhost',
      );
      if (url.pathname === '/api/v3/services') {
        const category = url.searchParams.get('category');
        return Promise.resolve(
          Response.json(
            catalogEnvelope(
              catalogServices
                .filter((service) => !category || service.category === category)
                .map((service) => ({
                  ...service,
                  lang: {
                    ...service.lang,
                    en: `Real service ${service.number}`,
                  },
                })),
            ),
          ),
        );
      }
      return Promise.resolve(catalogResponse(url));
    }),
  );
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

function renderIdentity() {
  renderRoute('/services/00000000-0000-4000-8000-000000000001');
  return screen.findByLabelText(i18n.t('identity.pinLabel'), { exact: true });
}

describe('identity entry', () => {
  it('requires 14 digits, supports keypad editing and gives only a local format result', async () => {
    const user = userEvent.setup();
    const pin = await renderIdentity();
    const submit = screen.getByRole('button', {
      name: i18n.t('identity.continue'),
      exact: true,
    });
    expect(submit).toBeEnabled();
    await user.type(pin, '1');
    await user.tab();
    expect(
      screen.queryByText(i18n.t('identity.pinError')),
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('identity.delete'),
        exact: true,
      }),
    );
    expect(pin).toHaveValue('');
    expect(
      screen.queryByText(i18n.t('identity.pinError')),
    ).not.toBeInTheDocument();
    await user.type(pin, '0000000000000');
    expect(submit).toBeEnabled();
    expect(
      screen.queryByText(i18n.t('identity.pinError')),
    ).not.toBeInTheDocument();
    await user.click(submit);
    expect(
      await screen.findByText(i18n.t('identity.pinError')),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '0', exact: true }));
    expect(
      screen.queryByText(i18n.t('identity.pinError')),
    ).not.toBeInTheDocument();
    await user.tab();
    expect(
      screen.queryByText(i18n.t('identity.pinError')),
    ).not.toBeInTheDocument();
    await user.click(submit);
    expect(
      await screen.findByText(i18n.t('identity.nextTitle')),
    ).toBeInTheDocument();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(Object.values(window.localStorage).join('')).not.toContain(
      '00000000000000',
    );
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('identity.delete'),
        exact: true,
      }),
    );
    expect(pin).toHaveValue('0000000000000');
    expect(
      screen.queryByText(i18n.t('identity.pinError')),
    ).not.toBeInTheDocument();
    expect(submit).toBeEnabled();
    expect(
      screen.queryByText(i18n.t('identity.nextTitle')),
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('identity.clear'),
        exact: true,
      }),
    );
    expect(pin).toHaveValue('');
    await user.click(submit);
    expect(
      await screen.findByText(i18n.t('identity.pinError')),
    ).toBeInTheDocument();
    await user.click(pin);
    await user.paste('0000000000000');
    expect(pin).toHaveValue('0000000000000');
    expect(
      screen.queryByText(i18n.t('identity.pinError')),
    ).not.toBeInTheDocument();
    await user.tab();
    expect(
      screen.queryByText(i18n.t('identity.pinError')),
    ).not.toBeInTheDocument();
  });

  it('clears old identification values when changing method and validates passport fields', async () => {
    const user = userEvent.setup();
    const pin = await renderIdentity();
    await user.type(pin, '00000000000000');
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('identity.passportMethod'),
        exact: true,
      }),
    );
    const series = screen.getByLabelText(i18n.t('identity.seriesLabel'), {
      exact: true,
    });
    const number = screen.getByLabelText(i18n.t('identity.numberLabel'), {
      exact: true,
    });
    const submit = screen.getByRole('button', {
      name: i18n.t('identity.continue'),
      exact: true,
    });
    expect(submit).toBeEnabled();
    expect(
      screen.queryByText(i18n.t('identity.seriesError')),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(i18n.t('identity.numberError')),
    ).not.toBeInTheDocument();
    await user.type(series, 'a');
    await user.tab();
    expect(
      screen.queryByText(i18n.t('identity.seriesError')),
    ).not.toBeInTheDocument();
    await user.type(series, 'a');
    expect(series).toHaveValue('AA');
    await user.type(number, '000000');
    expect(submit).toBeEnabled();
    expect(
      screen.queryByText(i18n.t('identity.numberError')),
    ).not.toBeInTheDocument();
    await user.click(submit);
    expect(
      await screen.findByText(i18n.t('identity.numberError')),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '0', exact: true }));
    expect(submit).toBeEnabled();
    expect(
      screen.queryByText(i18n.t('identity.numberError')),
    ).not.toBeInTheDocument();
    await user.click(submit);
    expect(
      await screen.findByText(i18n.t('identity.nextTitle')),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('identity.pinMethod'),
        exact: true,
      }),
    );
    expect(
      screen.getByLabelText(i18n.t('identity.pinLabel'), { exact: true }),
    ).toHaveValue('');
    expect(
      screen.queryByText(i18n.t('identity.nextTitle')),
    ).not.toBeInTheDocument();
    expect(submit).toBeEnabled();
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('identity.passportMethod'),
        exact: true,
      }),
    );
    expect(
      screen.getByLabelText(i18n.t('identity.seriesLabel'), { exact: true }),
    ).toHaveValue('');
    expect(
      screen.queryByText(i18n.t('identity.seriesError')),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(i18n.t('identity.numberError')),
    ).not.toBeInTheDocument();
    expect(
      screen.getByLabelText(i18n.t('identity.numberLabel'), { exact: true }),
    ).toHaveValue('');
  });

  it('translates only visible submit errors without restoring errors cleared by an edit', async () => {
    const user = userEvent.setup();
    await renderIdentity();
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('identity.passportMethod'),
        exact: true,
      }),
    );
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('identity.continue'),
        exact: true,
      }),
    );
    expect(
      await screen.findByText(i18n.t('identity.seriesError')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t('identity.numberError')),
    ).toBeInTheDocument();
    await user.type(
      screen.getByLabelText(i18n.t('identity.seriesLabel'), { exact: true }),
      'a',
    );
    expect(
      screen.queryByText(i18n.t('identity.seriesError')),
    ).not.toBeInTheDocument();
    await act(() => i18n.changeLanguage('ru'));
    expect(
      await screen.findByText(i18n.t('identity.numberError')),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(i18n.t('identity.seriesError')),
    ).not.toBeInTheDocument();
  });

  it('removes entered identity data on finish and on the next session', async () => {
    const user = userEvent.setup();
    const pin = await renderIdentity();
    await user.type(pin, '00000000000000');
    await user.click(
      screen.getByRole('button', { name: 'Finish', exact: true }),
    );
    await user.click(await screen.findByRole('button', { name: /English/ }));
    await user.click(
      await screen.findByText('Real service 1', { exact: true }),
    );
    expect(
      await screen.findByLabelText(i18n.t('identity.pinLabel'), {
        exact: true,
      }),
    ).toHaveValue('');
  });
});
