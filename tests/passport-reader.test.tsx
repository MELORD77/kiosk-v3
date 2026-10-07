import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/app/providers/app-providers';
import { PassportReaderScreen } from '@/pages/service-placeholder/ui/passport-reader-screen';
import { useKioskSessionStore } from '@/features/kiosk-session';
import { i18n } from '@/shared/lib/i18n';
import type * as SharedConfig from '@/shared/config';

const configuration = vi.hoisted(() => ({
  baseUrl: 'http://hardware.test' as string | undefined,
}));
vi.mock('@/shared/config', async (importOriginal) => {
  const original = await importOriginal<typeof SharedConfig>();
  return {
    ...original,
    env: {
      ...original.env,
      get hardwareApiBaseUrl() {
        return configuration.baseUrl;
      },
    },
  };
});

const mrz = {
  ok: true,
  allChecksOk: true,
  format: 'TD1',
  documentType: 'I',
  issuingCountry: 'UZB',
  fullName: 'TEST PERSON',
  passportNumber: 'AA1234567',
  nationality: 'UZB',
  birthDate: '900101',
  sex: 'M',
  expiryDate: '300101',
  personalNumber: '12345678901234',
};

beforeEach(async () => {
  configuration.baseUrl = 'http://hardware.test';
  useKioskSessionStore.getState().startSession();
  await i18n.changeLanguage('en');
});

function renderReader() {
  const onBack = vi.fn();
  const onManual = vi.fn();
  return {
    ...render(
      <AppProviders>
        <PassportReaderScreen onBack={onBack} onManual={onManual} />
      </AppProviders>,
    ),
    onBack,
    onManual,
  };
}

function start() {
  fireEvent.click(screen.getByRole('button', { name: 'Start reading' }));
}

describe('passport reader integration', () => {
  it('fails closed without a hardware URL and preserves manual entry', () => {
    configuration.baseUrl = undefined;
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    const { onManual } = renderReader();
    expect(
      screen.getByRole('button', { name: 'Start reading' }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Enter manually' }));
    expect(onManual).toHaveBeenCalledOnce();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('reads once, stops the reader, shows checked fields, and clears personal details', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ ok: true, mrz }));
    vi.stubGlobal('fetch', fetcher);
    renderReader();
    start();
    start();
    expect(await screen.findByText('TEST PERSON')).toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(screen.getByText('PINFL')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear details' }));
    await waitFor(() =>
      expect(screen.queryByText('TEST PERSON')).not.toBeInTheDocument(),
    );
  });

  it('does not label a non-PINFL personal number as PINFL', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({
          ok: true,
          mrz: { ...mrz, personalNumber: 'ABC123' },
        }),
      ),
    );
    renderReader();
    start();
    expect(await screen.findByText('ABC123')).toBeInTheDocument();
    expect(screen.getByText('Personal number')).toBeInTheDocument();
    expect(screen.queryByText('PINFL')).not.toBeInTheDocument();
  });

  it.each([
    ['no_document', 'Document was not detected. Reposition it and try again.'],
    [
      'invalid_mrz',
      'MRZ checks failed. Reposition the document and try again.',
    ],
    [
      'untrusted-server-text',
      'Reading failed. Try again or enter details manually.',
    ],
  ])('shows safe %s errors without retrying', async (error, message) => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(Response.json({ ok: false, error }));
    vi.stubGlobal('fetch', fetcher);
    renderReader();
    start();
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('untrusted-server-text')).not.toBeInTheDocument();
  });

  it('aborts and stops an active read before allowing another attempt', async () => {
    let readSignal: AbortSignal | null | undefined;
    let finishStop: ((response: Response) => void) | undefined;
    const fetcher = vi.fn(
      (input: string | URL | Request, init?: RequestInit) => {
        if (String(input).endsWith('/stop'))
          return new Promise<Response>((resolve) => {
            finishStop = resolve;
          });
        readSignal = init?.signal;
        return new Promise<Response>((_, reject) => {
          readSignal?.addEventListener(
            'abort',
            () => reject(new DOMException('Cancelled', 'AbortError')),
            { once: true },
          );
        });
      },
    );
    vi.stubGlobal('fetch', fetcher);
    renderReader();
    start();
    await screen.findByRole('button', { name: 'Cancel reading' });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel reading' }));
    expect(readSignal?.aborted).toBe(true);
    expect(
      screen.getByRole('button', { name: 'Start reading' }),
    ).toBeDisabled();
    await waitFor(() => expect(finishStop).toBeDefined());
    await act(async () => {
      finishStop?.(Response.json({ ok: true }));
    });
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Start reading' }),
      ).toBeEnabled(),
    );
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('clears the result when the session ends', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ ok: true, mrz })),
    );
    renderReader();
    start();
    await screen.findByText('TEST PERSON');
    act(() => useKioskSessionStore.getState().endSession());
    await waitFor(() =>
      expect(screen.queryByText('TEST PERSON')).not.toBeInTheDocument(),
    );
  });

  it('aborts and stops an active read on unmount', async () => {
    let readSignal: AbortSignal | null | undefined;
    const fetcher = vi.fn(
      (input: string | URL | Request, init?: RequestInit) => {
        if (String(input).endsWith('/stop'))
          return Promise.resolve(Response.json({ ok: true }));
        readSignal = init?.signal;
        return new Promise<Response>((_, reject) => {
          readSignal?.addEventListener(
            'abort',
            () => reject(new DOMException('Cancelled', 'AbortError')),
            { once: true },
          );
        });
      },
    );
    vi.stubGlobal('fetch', fetcher);
    const { unmount } = renderReader();
    start();
    await screen.findByRole('button', { name: 'Cancel reading' });
    unmount();
    expect(readSignal?.aborted).toBe(true);
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
  });
});
