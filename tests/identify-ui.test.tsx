import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Fragment, StrictMode, useEffect } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/app/providers/app-providers';
import { AppRouter } from '@/app/router/app-router';
import { useKioskSessionStore } from '@/features/kiosk-session';
import { i18n, languages } from '@/shared/lib/i18n';
import type * as SharedApi from '@/shared/api';
import {
  catalogEnvelope,
  catalogResponse,
  catalogServices,
} from './fixtures/service-catalog';
import { citizenResults } from './fixtures/citizen-results';
import type { FaceCaptureProps } from '@/features/face-capture';

vi.mock('@/features/face-capture', () => ({
  FaceCapture: ({ active, onCapture, onCancel }: FaceCaptureProps) =>
    active ? (
      <>
        <button
          onClick={() =>
            onCapture(new Blob(['face-photo'], { type: 'image/jpeg' }))
          }
        >
          {i18n.t('face.capture')}
        </button>
        <button onClick={onCancel}>{i18n.t('face.cancel')}</button>
      </>
    ) : null,
}));

vi.mock('@/shared/api', async (importOriginal) => {
  const original = await importOriginal<typeof SharedApi>();
  return {
    ...original,
    apiClient: original.createApiClient({
      fetcher: (input, init) => globalThis.fetch(input, init),
    }),
  };
});

const serviceRequest = vi.fn<typeof fetch>();
const photo = 'data:image/jpeg;base64,ZmFjZS1waG90bw==';
const routes: Record<number, string> = {
  7: 'residence',
  8: 'residents',
  12: 'criminal-record',
  22: 'release',
};

beforeEach(async () => {
  useKioskSessionStore.getState().endSession();
  await i18n.changeLanguage('en');
  serviceRequest.mockReset();
  serviceRequest.mockImplementation((input) => {
    const fixture = citizenResults.find((item) =>
      input.toString().endsWith(routes[item.number] ?? ''),
    );
    return Promise.resolve(
      Response.json(catalogEnvelope(fixture?.result ?? null)),
    );
  });
  vi.stubGlobal(
    'fetch',
    vi.fn<typeof fetch>((input, init) => {
      const url = new URL(
        input instanceof Request ? input.url : input.toString(),
        'http://localhost',
      );
      if (url.pathname.startsWith('/api/v3/citizen/'))
        return serviceRequest(input, init);
      return Promise.resolve(catalogResponse(url));
    }),
  );
});

function QueryStateProbe({
  onReady,
}: {
  onReady: (client: QueryClient) => void;
}) {
  const client = useQueryClient();
  const { pathname } = useLocation();
  useEffect(() => onReady(client), [client, onReady]);
  return <output data-testid="current-path">{pathname}</output>;
}

async function openForm(path = '/services/residents', strict = false) {
  const user = userEvent.setup();
  const Mode = strict ? StrictMode : Fragment;
  const captured: { client: QueryClient | null } = { client: null };
  const onReady = (client: QueryClient) => {
    captured.client = client;
  };
  const view = render(
    <Mode>
      <AppProviders>
        <MemoryRouter initialEntries={[path]}>
          <QueryStateProbe onReady={onReady} />
          <AppRouter />
        </MemoryRouter>
      </AppProviders>
    </Mode>,
  );
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
  return { user, getQueryClient: () => captured.client, ...view };
}

function continueButton() {
  return screen.getByRole('button', {
    name: i18n.t('identity.continue'),
    exact: true,
  });
}

async function captureFace(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    await screen.findByRole('button', {
      name: i18n.t('face.capture'),
      exact: true,
    }),
  );
}

async function enterDocument(
  user: ReturnType<typeof userEvent.setup>,
  method: 'PASSPORT' | 'PINFL' = 'PASSPORT',
) {
  await user.click(
    screen.getByRole('button', {
      name: i18n.t(
        method === 'PINFL' ? 'identity.pinMethod' : 'identity.passportMethod',
      ),
      exact: true,
    }),
  );
  if (method === 'PINFL') {
    await user.type(
      screen.getByLabelText(i18n.t('identity.pinLabel'), { exact: true }),
      '12345678901234',
    );
  } else {
    await user.type(
      screen.getByLabelText(i18n.t('identity.seriesLabel'), { exact: true }),
      'AA',
    );
    await user.type(
      screen.getByLabelText(i18n.t('identity.numberLabel'), { exact: true }),
      '1234567',
    );
    await user.type(
      screen.getByLabelText(i18n.t('identity.birthDateLabel'), { exact: true }),
      '15041990',
    );
  }
  await user.click(continueButton());
}

function errorResponse(status: number, message = 'Synthetic service error') {
  return Response.json(
    {
      message: { en: message, uz: message, cr: message, ru: message },
      result: null,
      meta: null,
    },
    { status },
  );
}

async function retry(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    await screen.findByRole('button', {
      name: i18n.t('faceVerification.retry'),
      exact: true,
    }),
  );
}

function footerBack() {
  return within(screen.getByRole('contentinfo')).getByRole('button', {
    name: i18n.t('common.back'),
    exact: true,
  });
}

describe('citizen service POST integration', () => {
  it.each([7, 8, 12, 22])(
    'requests service %s once with document and photo, then clears private state on exit',
    async (number) => {
      const { user, getQueryClient } = await openForm(
        `/services/${routes[number]}`,
        true,
      );
      await enterDocument(user);
      expect(
        await screen.findByRole('button', {
          name: i18n.t('face.capture'),
          exact: true,
        }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', {
          name: i18n.t('face.start'),
          exact: true,
        }),
      ).not.toBeInTheDocument();
      expect(serviceRequest).not.toHaveBeenCalled();
      await captureFace(user);
      expect(
        await screen.findByText(i18n.t('serviceResult.title')),
      ).toBeInTheDocument();
      expect(serviceRequest).toHaveBeenCalledTimes(1);
      expect(String(serviceRequest.mock.calls[0]?.[0])).toContain(
        `/api/v3/citizen/${routes[number]}`,
      );
      const init = serviceRequest.mock.calls[0]?.[1];
      expect(init?.method).toBe('POST');
      expect(JSON.parse(String(init?.body))).toEqual({
        method: 'PASSPORT',
        passportSerial: 'AA1234567',
        birthDate: '15.04.1990',
        photo,
      });
      expect(new Headers(init?.headers).get('x-app-lang')).toBe('en');
      expect(new Headers(init?.headers).has('x-user-uuid')).toBe(false);
      await act(async () => {
        await i18n.changeLanguage('uzc');
      });
      expect(serviceRequest).toHaveBeenCalledTimes(1);
      await user.click(footerBack());
      expect(
        await screen.findByRole('heading', { name: i18n.t('home.title') }),
      ).toBeInTheDocument();
      await waitFor(() => {
        const client = getQueryClient();
        expect(client).not.toBeNull();
        const cache = JSON.stringify({
          queries: client
            ?.getQueryCache()
            .getAll()
            .map((item) => item.state),
          mutations: client
            ?.getMutationCache()
            .getAll()
            .map((item) => item.state),
        });
        for (const value of ['AA1234567', '15.04.1990', photo]) {
          expect(cache).not.toContain(value);
          expect(Object.values(localStorage).join('')).not.toContain(value);
          expect(Object.values(sessionStorage).join('')).not.toContain(value);
        }
      });
      expect(
        vi
          .mocked(fetch)
          .mock.calls.some(([input]) =>
            /\/(identify|face)$/.test(String(input)),
          ),
      ).toBe(false);
    },
  );

  it('submits PINFL only together with a photo', async () => {
    const { user } = await openForm();
    await enterDocument(user, 'PINFL');
    expect(serviceRequest).not.toHaveBeenCalled();
    await captureFace(user);
    expect(await screen.findByText('EXAMPLE RESIDENT')).toBeInTheDocument();
    expect(JSON.parse(String(serviceRequest.mock.calls[0]?.[1]?.body))).toEqual(
      { method: 'PINFL', pinfl: '12345678901234', photo },
    );
  });

  it('ignores duplicate capture callbacks while one POST is pending', async () => {
    let finish: (response: Response) => void = () => {};
    serviceRequest.mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    );
    const { user } = await openForm();
    await enterDocument(user);
    const capture = await screen.findByRole('button', {
      name: i18n.t('face.capture'),
      exact: true,
    });
    await act(async () => {
      fireEvent.click(capture);
      fireEvent.click(capture);
    });
    await waitFor(() => expect(serviceRequest).toHaveBeenCalledTimes(1));
    await act(async () => {
      finish(Response.json(catalogEnvelope(citizenResults[1]?.result)));
    });
    expect(await screen.findByText('EXAMPLE RESIDENT')).toBeInTheDocument();
    expect(serviceRequest).toHaveBeenCalledTimes(1);
  });

  it('retains the document when a 403 requires a new photo', async () => {
    serviceRequest.mockResolvedValueOnce(errorResponse(403));
    const { user } = await openForm();
    await enterDocument(user);
    await captureFace(user);
    await retry(user);
    await captureFace(user);
    expect(await screen.findByText('EXAMPLE RESIDENT')).toBeInTheDocument();
    expect(serviceRequest).toHaveBeenCalledTimes(2);
    expect(serviceRequest.mock.calls[1]?.[1]?.body).toBe(
      serviceRequest.mock.calls[0]?.[1]?.body,
    );
  });

  it.each([
    ['PASSPORT', 404],
    ['PINFL', 503],
  ] as const)(
    'returns %s status %s to the form with document values and server message',
    async (method, status) => {
      serviceRequest.mockResolvedValueOnce(
        errorResponse(status, 'Document lookup unavailable'),
      );
      const { user } = await openForm();
      await enterDocument(user, method);
      await captureFace(user);
      expect(
        await screen.findByText('Document lookup unavailable'),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(
          i18n.t(
            method === 'PINFL' ? 'identity.pinLabel' : 'identity.numberLabel',
          ),
          { exact: true },
        ),
      ).toHaveValue(method === 'PINFL' ? '12345678901234' : '1234567');
      expect(
        screen.getByRole('button', {
          name: i18n.t('identity.passportMethod'),
          exact: true,
        }),
      ).toBeEnabled();
      expect(serviceRequest).toHaveBeenCalledTimes(1);
    },
  );

  it.each([500, 503])(
    'does not automatically retry failed passport POST status %s',
    async (status) => {
      serviceRequest.mockResolvedValueOnce(errorResponse(status));
      const { user } = await openForm();
      await enterDocument(user);
      await captureFace(user);
      expect(
        await screen.findByRole('button', {
          name: i18n.t('faceVerification.retry'),
          exact: true,
        }),
      ).toBeEnabled();
      expect(serviceRequest).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('EXAMPLE RESIDENT')).not.toBeInTheDocument();
    },
  );

  it('returns home after three failures and removes session-owned data', async () => {
    serviceRequest.mockImplementation(() =>
      Promise.resolve(errorResponse(403)),
    );
    const { user, getQueryClient } = await openForm();
    const client = getQueryClient();
    if (!client) throw new Error('Missing query client');
    client.setQueryDefaults(['private-test'], { meta: { sessionOwned: true } });
    client.setQueryData(['private-test'], 'private');
    client.setQueryData(['public-test'], 'public');
    const signal = useKioskSessionStore.getState().signal;
    await enterDocument(user);
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      await captureFace(user);
      if (attempt < 3) await retry(user);
    }
    expect(
      await screen.findByRole('heading', { name: i18n.t('home.title') }),
    ).toBeInTheDocument();
    expect(serviceRequest).toHaveBeenCalledTimes(3);
    expect(signal.aborted).toBe(true);
    expect(client.getQueryData(['public-test'])).toBe('public');
    expect(
      client
        .getQueryCache()
        .getAll()
        .filter((item) => item.meta?.sessionOwned),
    ).toHaveLength(0);
    expect(
      client
        .getMutationCache()
        .getAll()
        .filter((item) => item.meta?.sessionOwned),
    ).toHaveLength(0);
  });

  it('counts failures across document correction round trips', async () => {
    serviceRequest.mockImplementation(() =>
      Promise.resolve(errorResponse(404, 'Correct the document')),
    );
    const { user } = await openForm();
    await enterDocument(user);
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      await captureFace(user);
      if (attempt < 3) {
        expect(
          await screen.findByText('Correct the document'),
        ).toBeInTheDocument();
        await user.click(continueButton());
      }
    }
    expect(
      await screen.findByRole('heading', { name: i18n.t('home.title') }),
    ).toBeInTheDocument();
    expect(serviceRequest).toHaveBeenCalledTimes(3);
  });

  it('allows a successful third request', async () => {
    serviceRequest
      .mockResolvedValueOnce(errorResponse(403))
      .mockResolvedValueOnce(errorResponse(500));
    const { user } = await openForm();
    await enterDocument(user);
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      await captureFace(user);
      if (attempt < 3) await retry(user);
    }
    expect(await screen.findByText('EXAMPLE RESIDENT')).toBeInTheDocument();
    expect(serviceRequest).toHaveBeenCalledTimes(3);
  });

  it.each(['back', 'session end'])(
    'aborts pending POST on %s and ignores late success',
    async (action) => {
      let signal: AbortSignal | null | undefined;
      let finish: (response: Response) => void = () => {};
      serviceRequest.mockImplementation((_input, init) => {
        signal = init?.signal;
        return new Promise<Response>((resolve) => {
          finish = resolve;
        });
      });
      const { user } = await openForm();
      await enterDocument(user);
      await captureFace(user);
      await waitFor(() => expect(serviceRequest).toHaveBeenCalledTimes(1));
      if (action === 'back') {
        await user.click(footerBack());
        expect(
          await screen.findByLabelText(i18n.t('identity.numberLabel'), {
            exact: true,
          }),
        ).toHaveValue('1234567');
      } else {
        await act(async () => {
          useKioskSessionStore.getState().endSession();
        });
      }
      expect(signal?.aborted).toBe(true);
      await act(async () => {
        finish(Response.json(catalogEnvelope(citizenResults[1]?.result)));
      });
      expect(screen.queryByText('EXAMPLE RESIDENT')).not.toBeInTheDocument();
      expect(serviceRequest).toHaveBeenCalledTimes(1);
    },
  );

  it('returns from camera to retained form without making an API request', async () => {
    const { user } = await openForm();
    await enterDocument(user);
    await user.click(
      await screen.findByRole('button', {
        name: i18n.t('face.cancel'),
        exact: true,
      }),
    );
    expect(
      await screen.findByLabelText(i18n.t('identity.numberLabel'), {
        exact: true,
      }),
    ).toHaveValue('1234567');
    expect(serviceRequest).not.toHaveBeenCalled();
    await user.click(continueButton());
    expect(
      await screen.findByRole('button', {
        name: i18n.t('face.capture'),
        exact: true,
      }),
    ).toBeInTheDocument();
  });

  it('rejects invalid manual data locally', async () => {
    const { user } = await openForm();
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('identity.pinMethod'),
        exact: true,
      }),
    );
    await user.type(
      screen.getByLabelText(i18n.t('identity.pinLabel'), { exact: true }),
      '123',
    );
    await user.click(continueButton());
    expect(
      await screen.findByText(i18n.t('identity.pinError')),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('identity.passportMethod'),
        exact: true,
      }),
    );
    await user.click(continueButton());
    expect(
      await screen.findByText(i18n.t('identity.seriesError')),
    ).toBeInTheDocument();
    expect(serviceRequest).not.toHaveBeenCalled();
  });
  it('uses footer Back for internal steps and restores language controls on the service list', async () => {
    const { user } = await openForm();
    const sessionId = useKioskSessionStore.getState().sessionId;
    function footerBack() {
      expect(
        within(screen.getByRole('main')).queryByRole('button', {
          name: i18n.t('common.back'),
          exact: true,
        }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('group', { name: i18n.t('common.language') }),
      ).not.toBeInTheDocument();
      return within(screen.getByRole('contentinfo')).getByRole('button', {
        name: i18n.t('common.back'),
        exact: true,
      });
    }
    await user.click(footerBack());
    expect(
      await screen.findByRole('heading', {
        name: i18n.t('serviceFlow.methodTitle'),
      }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('serviceFlow.idCardTitle'),
        exact: true,
      }),
    );
    expect(
      await screen.findByRole('heading', {
        name: i18n.t('serviceFlow.idCardTitle'),
      }),
    ).toBeInTheDocument();
    await user.click(footerBack());
    expect(
      await screen.findByRole('heading', {
        name: i18n.t('serviceFlow.methodTitle'),
      }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('serviceFlow.readerTitle'),
        exact: true,
      }),
    );
    expect(
      await screen.findByRole('heading', {
        name: i18n.t('passportReader.title'),
      }),
    ).toBeInTheDocument();
    await user.click(footerBack());
    expect(
      await screen.findByRole('heading', {
        name: i18n.t('serviceFlow.methodTitle'),
      }),
    ).toBeInTheDocument();
    await user.click(footerBack());
    expect(
      await screen.findByRole('button', {
        name: i18n.t('identity.continue'),
        exact: true,
      }),
    ).toBeInTheDocument();
    await user.click(footerBack());
    expect(
      await screen.findByRole('heading', { name: i18n.t('home.title') }),
    ).toBeInTheDocument();
    const languageGroup = screen.getByRole('group', {
      name: i18n.t('common.language'),
    });
    expect(within(languageGroup).getAllByRole('button')).toHaveLength(
      languages.length,
    );
    expect(useKioskSessionStore.getState().isActive).toBe(true);
    expect(useKioskSessionStore.getState().sessionId).toBe(sessionId);
  });

  it('keeps an unavailable service outside the manual identification flow', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(() =>
        Promise.resolve(
          Response.json(
            catalogEnvelope({ ...catalogServices[0], status: 'MAINTENANCE' }),
          ),
        ),
      ),
    );
    render(
      <AppProviders>
        <MemoryRouter
          initialEntries={['/services/00000000-0000-4000-8000-000000000001']}
        >
          <AppRouter />
        </MemoryRouter>
      </AppProviders>,
    );
    expect(
      await screen.findByText(i18n.t('serviceStatus.MAINTENANCE')),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: i18n.t('identity.continue'),
        exact: true,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(i18n.t('identity.pinLabel'), { exact: true }),
    ).not.toBeInTheDocument();
    expect(serviceRequest).not.toHaveBeenCalled();
  });
});
