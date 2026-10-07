import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { AppProviders } from '@/app/providers/app-providers';
import { AppRouter } from '@/app/router/app-router';
import { useKioskSessionStore } from '@/features/kiosk-session';
import { i18n, toUzbekUiText } from '@/shared/lib/i18n';
import type * as SharedApi from '@/shared/api';
import type * as SharedConfig from '@/shared/config';
import { IdentityForm } from '@/pages/service-placeholder/ui/identity-form';
import {
  catalogEnvelope,
  catalogResponse,
  catalogServices,
  serviceDetail,
} from './fixtures/service-catalog';

vi.mock('@/shared/config', async (importOriginal) => {
  const original = await importOriginal<typeof SharedConfig>();
  return {
    ...original,
    env: { ...original.env, hardwareApiBaseUrl: undefined },
  };
});

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

async function enterManual(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    await screen.findByRole('button', {
      name: i18n.t('identity.continue'),
      exact: true,
    }),
  );
  await user.click(
    screen.getByRole('button', {
      name: i18n.t('serviceFlow.manualTitle'),
      exact: true,
    }),
  );
  await user.click(
    screen.getByRole('button', {
      name: i18n.t('identity.pinMethod'),
      exact: true,
    }),
  );
}

async function renderIdentity() {
  renderRoute('/services/00000000-0000-4000-8000-000000000001');
  await enterManual(userEvent.setup());
  return screen.findByLabelText(i18n.t('identity.pinLabel'), { exact: true });
}

describe('identity entry', () => {
  it('keeps one identification request pending until its callback completes', async () => {
    const user = userEvent.setup();
    let finish = () => {};
    const identification = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const onIdentify = vi.fn(() => identification);
    const { container } = render(
      <IdentityForm
        serviceName="Test service"
        onBack={() => {}}
        onIdentify={onIdentify}
      />,
    );
    await user.type(
      screen.getByLabelText(i18n.t('identity.pinLabel'), { exact: true }),
      '12345678901234',
    );
    const form = container.querySelector('form');
    if (!form) throw new Error('Identification form missing');
    await act(async () => {
      fireEvent.submit(form);
      fireEvent.submit(form);
    });
    expect(onIdentify).toHaveBeenCalledTimes(1);
    const submit = screen.getByRole('button', {
      name: i18n.t('identity.sending'),
      exact: true,
    });
    expect(submit).toBeDisabled();
    expect(
      screen.getByRole('button', {
        name: i18n.t('identity.passportMethod'),
        exact: true,
      }),
    ).toBeDisabled();
    expect(form).toHaveAttribute('aria-busy', 'true');
    await act(async () => {
      finish();
      await identification;
    });
    expect(submit).toBeEnabled();
    expect(form).toHaveAttribute('aria-busy', 'false');
  });
  it('offers a full keyboard with shift and native keyboard activation', async () => {
    const user = userEvent.setup();
    await renderIdentity();
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('identity.passportMethod'),
        exact: true,
      }),
    );
    expect(
      screen.getByRole('button', { name: '1', exact: true }),
    ).toHaveAttribute('type', 'button');
    expect(
      screen.getByRole('button', {
        name: i18n.t('identity.space'),
        exact: true,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: i18n.t('identity.nextField'),
        exact: true,
      }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('identity.shift'),
        exact: true,
      }),
    );
    expect(
      screen.getByRole('button', { name: '!', exact: true }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('identity.shift'),
        exact: true,
      }),
    );
    const letter = screen.getByRole('button', { name: 'A', exact: true });
    letter.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'A', exact: true })).toBe(letter);
    expect(
      screen.getByLabelText(i18n.t('identity.seriesLabel'), { exact: true }),
    ).toHaveValue('A');
    await user.keyboard(' ');
    expect(
      screen.getByLabelText(i18n.t('identity.seriesLabel'), { exact: true }),
    ).toHaveValue('AA');
  });
  it('focuses the current input and switches to numbers after completing the series', async () => {
    const user = userEvent.setup();
    const pin = await renderIdentity();
    expect(pin).toHaveFocus();
    expect(pin).toHaveAttribute('inputmode', 'none');
    const one = screen.getByRole('button', { name: '1', exact: true });
    await user.click(one);
    expect(screen.getByRole('button', { name: '1', exact: true })).toBe(one);
    expect(pin).toHaveFocus();
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
    const birthDate = screen.getByLabelText(i18n.t('identity.birthDateLabel'), {
      exact: true,
    });
    expect(series).toHaveAttribute('inputmode', 'none');
    expect(birthDate).toHaveAttribute('inputmode', 'none');
    expect(series).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'A', exact: true }));
    expect(series).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'D', exact: true }));
    expect(series).toHaveValue('AD');
    expect(number).toHaveFocus();
    expect(number).toHaveAttribute('inputmode', 'none');
    expect(
      screen.getByRole('group', { name: i18n.t('identity.numberKeyboard') }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '7', exact: true }));
    expect(number).toHaveFocus();
    expect(number).toHaveValue('7');
    await user.click(series);
    await user.clear(series);
    await user.type(series, 'aa');
    expect(number).toHaveFocus();
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('identity.clear'),
        exact: true,
      }),
    );
    expect(series).toHaveFocus();
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('identity.pinMethod'),
        exact: true,
      }),
    );
    expect(
      screen.getByLabelText(i18n.t('identity.pinLabel'), { exact: true }),
    ).toHaveFocus();
  });

  it('requires 14 digits, supports keypad editing and shows server feedback', async () => {
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
    expect(pin).toHaveAttribute('aria-invalid', 'true');
    expect(pin).toHaveAttribute('aria-describedby', 'identity-pin-error');
    await user.click(screen.getByRole('button', { name: '0', exact: true }));
    expect(
      screen.queryByText(i18n.t('identity.pinError')),
    ).not.toBeInTheDocument();
    expect(pin).toHaveAttribute('aria-invalid', 'false');
    expect(pin).not.toHaveAttribute('aria-describedby');
    await user.tab();
    expect(
      screen.queryByText(i18n.t('identity.pinError')),
    ).not.toBeInTheDocument();
    await user.click(submit);
    expect(
      await screen.findByText(i18n.t('identity.receivedTitle')),
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
      screen.queryByText(i18n.t('identity.receivedTitle')),
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
    const birthDate = screen.getByLabelText(i18n.t('identity.birthDateLabel'), {
      exact: true,
    });
    expect(birthDate).toHaveFocus();
    await user.type(birthDate, '15041990');
    expect(birthDate).toHaveValue('15.04.1990');
    await user.click(submit);
    expect(
      await screen.findByText(i18n.t('identity.receivedTitle')),
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
      screen.queryByText(i18n.t('identity.receivedTitle')),
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
    await enterManual(user);
    expect(
      await screen.findByLabelText(i18n.t('identity.pinLabel'), {
        exact: true,
      }),
    ).toHaveValue('');
  });
});

describe('service preparation flow', () => {
  it.each([
    ['uz', 'uz'],
    ['uzc', 'cr'],
    ['ru', 'ru'],
    ['en', 'en'],
  ] as const)('shows supplied service details in %s', async (locale, field) => {
    await i18n.changeLanguage(locale);
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(Response.json(catalogEnvelope(serviceDetail))),
      ),
    );
    renderRoute(`/services/${serviceDetail.id}`);
    expect(
      await screen.findByRole('heading', {
        name:
          locale === 'uz'
            ? toUzbekUiText(serviceDetail.lang[field])
            : serviceDetail.lang[field],
      }),
    ).toBeInTheDocument();
    for (const value of [
      serviceDetail.department[field],
      serviceDetail.result[field],
      `${serviceDetail.price.text[field]} (${serviceDetail.price.bhmText[field]})`,
    ]) {
      expect(
        screen.getByText(locale === 'uz' ? toUzbekUiText(value) : value, {
          exact: true,
        }),
      ).toBeInTheDocument();
    }
    expect(screen.getAllByText(i18n.t('serviceFlow.notProvided'))).toHaveLength(
      2,
    );
    expect(screen.queryByText('TRADITIONAL')).not.toBeInTheDocument();
    expect(screen.queryByText('ELECTRONIC')).not.toBeInTheDocument();
  });

  it('shows unknown conditions without inventing requirements and offers an unavailable reader', async () => {
    const user = userEvent.setup();
    renderRoute('/services/00000000-0000-4000-8000-000000000001');
    const continueButton = await screen.findByRole('button', {
      name: i18n.t('identity.continue'),
      exact: true,
    });
    expect(
      await screen.findByText(i18n.t('serviceFlow.overviewTitle')),
    ).toBeInTheDocument();
    expect(screen.getAllByText(i18n.t('serviceFlow.notProvided'))).toHaveLength(
      6,
    );
    await user.click(continueButton);
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('serviceFlow.readerTitle'),
        exact: true,
      }),
    );
    expect(
      screen.getByRole('button', { name: i18n.t('serviceFlow.startReading') }),
    ).toBeDisabled();
    expect(
      screen.getByText(i18n.t('passportReader.notice')),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('serviceFlow.manualTitle'),
        exact: true,
      }),
    );
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('identity.pinMethod'),
        exact: true,
      }),
    );
    const pin = screen.getByLabelText(i18n.t('identity.pinLabel'), {
      exact: true,
    });
    await user.type(pin, '00000000000000');
    await user.click(
      screen.getByRole('button', { name: i18n.t('common.back'), exact: true }),
    );
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('serviceFlow.manualTitle'),
        exact: true,
      }),
    );
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('identity.pinMethod'),
        exact: true,
      }),
    );
    expect(
      screen.getByLabelText(i18n.t('identity.pinLabel'), { exact: true }),
    ).toHaveValue('');
    await user.click(
      screen.getByRole('button', { name: i18n.t('common.back'), exact: true }),
    );
    await user.click(
      screen.getByRole('button', { name: i18n.t('common.back'), exact: true }),
    );
    expect(
      screen.getByText(i18n.t('serviceFlow.overviewTitle')),
    ).toBeInTheDocument();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});
