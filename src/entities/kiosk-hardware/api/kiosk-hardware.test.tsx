import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  readPassport,
  stopPassport,
  fetchPassportInfo,
  useReadPassport,
} from './passport';

const { config } = vi.hoisted(() => ({
  config: { hardwareApiBaseUrl: 'http://hardware.test' as string | undefined },
}));
vi.mock('@/shared/config', () => ({ env: config }));

const fetcher = vi.fn<typeof fetch>();
const mrz = {
  ok: true,
  allChecksOk: true,
  format: 'TD3',
  documentType: 'P',
  issuingCountry: 'UTO',
  fullName: 'ERIKSSON ANNA MARIA',
  passportNumber: 'L898902C3',
  nationality: 'UTO',
  birthDate: '12.08.1974',
  sex: 'F',
  expiryDate: '15.04.2012',
  personalNumber: 'ZE184226B',
  rawLine1: 'private MRZ',
  rawLine2: 'private MRZ',
};
function respond(body: unknown) {
  fetcher.mockResolvedValue(new Response(JSON.stringify(body)));
}
function wrapperFor(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

describe('kiosk hardware integration', () => {
  beforeEach(() => {
    config.hardwareApiBaseUrl = 'http://hardware.test';
    fetcher.mockReset();
    vi.stubGlobal('fetch', fetcher);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('uses the same-origin hardware proxy only in development', async () => {
    respond({ ok: true });
    vi.stubEnv('DEV', true);
    vi.stubEnv('MODE', 'development');
    await fetchPassportInfo();
    expect(fetcher).toHaveBeenLastCalledWith(
      '/device-api/api/passport/info',
      expect.anything(),
    );
    vi.stubEnv('DEV', false);
    vi.stubEnv('MODE', 'production');
    respond({ ok: true });
    await fetchPassportInfo();
    expect(fetcher).toHaveBeenLastCalledWith(
      'http://hardware.test/api/passport/info',
      expect.anything(),
    );
    config.hardwareApiBaseUrl = undefined;
    vi.stubEnv('DEV', true);
    vi.stubEnv('MODE', 'development');
    await expect(fetchPassportInfo()).rejects.toMatchObject({
      code: 'not_configured',
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('fails closed when hardware configuration is absent', async () => {
    config.hardwareApiBaseUrl = undefined;
    await expect(readPassport()).rejects.toMatchObject({
      code: 'not_configured',
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('reads the document explicitly without caching or retaining raw MRZ', async () => {
    respond({ ok: true, mrz });
    const result = await readPassport();
    expect(result.passportNumber).toBe(mrz.passportNumber);
    expect(result).not.toHaveProperty('rawLine1');
    expect(fetcher).toHaveBeenCalledExactlyOnceWith(
      'http://hardware.test/api/passport/read',
      expect.objectContaining({
        method: 'GET',
        cache: 'no-store',
        credentials: 'omit',
      }),
    );
  });

  it.each([
    { ok: false, error: 'no_document', message: 'private document detail' },
    { ok: true, mrz: { ok: false, error: 'private document detail' } },
    { ok: true, mrz: { ...mrz, allChecksOk: false } },
  ])('rejects unsuccessful hardware or MRZ results', async (body) => {
    respond(body);
    await expect(readPassport()).rejects.toMatchObject({
      name: 'HardwareError',
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('does not expose unknown device errors or personal response data', async () => {
    respond({ ok: false, error: 'private document detail', mrz });
    await expect(readPassport()).rejects.toMatchObject({
      code: 'device_failure',
      message: 'The hardware operation could not be completed.',
    });
  });

  it('bounds read time and preserves caller cancellation', async () => {
    vi.useFakeTimers();
    fetcher.mockImplementation(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          );
        }),
    );
    const pending = readPassport();
    const assertion = expect(pending).rejects.toMatchObject({
      code: 'timeout',
    });
    await vi.advanceTimersByTimeAsync(20_000);
    await assertion;
    const controller = new AbortController();
    const cancelled = readPassport(controller.signal);
    controller.abort();
    await expect(cancelled).rejects.toMatchObject({ name: 'AbortError' });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('serializes reader teardown before a new screen starts another read', async () => {
    let completeFirstRead: ((response: Response) => void) | undefined;
    fetcher.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          completeFirstRead = resolve;
        }),
    );
    const first = readPassport();
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    const stop = stopPassport();
    const next = readPassport();
    expect(fetcher).toHaveBeenCalledTimes(1);
    fetcher.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true })));
    fetcher.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true, mrz })),
    );
    completeFirstRead?.(new Response(JSON.stringify({ ok: true, mrz })));
    await Promise.all([first, stop, next]);
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
      'http://hardware.test/api/passport/read',
      'http://hardware.test/api/passport/stop',
      'http://hardware.test/api/passport/read',
    ]);
  });

  it('keeps partially documented info fields optional and strips unknown details', async () => {
    respond({
      ok: true,
      port: 'COM13',
      privateDetails: mrz,
      transport: { connected: false },
    });
    await expect(fetchPassportInfo()).resolves.toEqual({
      ok: true,
      port: 'COM13',
      transport: { connected: false },
    });
    respond({ ok: true });
    await expect(stopPassport()).resolves.toBeUndefined();
  });

  it('never automatically retries hardware mutations and removes unobserved sensitive results', async () => {
    const client = new QueryClient({
      defaultOptions: { mutations: { retry: 3 } },
    });
    const hook = renderHook(() => useReadPassport(), {
      wrapper: wrapperFor(client),
    });
    respond({ ok: false, error: 'no_document' });
    await act(async () => {
      await expect(hook.result.current.mutateAsync({})).rejects.toMatchObject({
        code: 'no_document',
      });
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
    respond({ ok: true, mrz });
    await act(async () => {
      await hook.result.current.mutateAsync({});
    });
    hook.unmount();
    await waitFor(() =>
      expect(client.getMutationCache().getAll()).toHaveLength(0),
    );
    client.clear();
  });
});
