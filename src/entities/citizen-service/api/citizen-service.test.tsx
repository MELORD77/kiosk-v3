import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as SharedApi from '@/shared/api';

import { citizenServiceKeys } from './citizen-request';
import type { CitizenServiceParams } from './citizen-request';
import { fetchCitizenService, useCitizenService } from './citizen-service';
import { criminalRecordSchema } from './criminal-record';
import { identifyCitizen } from './identify';
import type { IdentifyRequest } from './identify';
import { releaseSchema } from './release';
import { residenceSchema } from './residence';
import { residentsSchema } from './residents';

const { fetcher } = vi.hoisted(() => ({ fetcher: vi.fn<typeof fetch>() }));
vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedApi>();
  return {
    ...actual,
    apiClient: actual.createApiClient({
      baseUrl: 'https://citizen.test',
      fetcher,
    }),
  };
});

const params: CitizenServiceParams = { uid: 'a'.repeat(64), language: 'uz' };
const registration = {
  cadaster: null,
  region: null,
  district: null,
  address: null,
  registrationDate: null,
};
const term = { years: null, months: '6', days: null, hours: null };
const residence = {
  firstName: null,
  lastName: null,
  middleName: null,
  birthday: null,
  gender: null,
  birthPlace: null,
  permanentRegistration: registration,
  temporaryRegistrations: [{ ...registration, validDate: null }],
  document: null,
  pdfLink: '',
};
const residents = {
  cadaster: '',
  address: null,
  permanent: [],
  temporary: [],
};
const criminalRecord = {
  isConvicted: true,
  records: [
    {
      crimeCaseNum: null,
      convictedDate: null,
      court: { country: null, region: null, area: null, organAddress: null },
      articles: [],
      term,
      additionalMeasures: [],
      arrestDate: null,
      freedDate: null,
      freedBy: null,
      note: null,
      additionalInfo: null,
    },
  ],
};
const release = {
  isReleased: true,
  records: [
    {
      crimeCaseNum: null,
      convictedDate: null,
      articles: [],
      term,
      freedDate: '01.01.2020',
      freedBy: null,
    },
  ],
};

function respond(result: unknown) {
  fetcher.mockImplementation(
    async () =>
      new Response(
        JSON.stringify({
          message: 'Success',
          result,
          meta: null,
          time: '2026-10-05T00:00:00Z',
        }),
      ),
  );
}
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return { queryClient, Wrapper };
}
beforeEach(() => {
  fetcher.mockReset();
});

describe('citizen service adapters', () => {
  it.each([
    [7, 'residence', residence],
    [8, 'residents', residents],
    [12, 'criminal-record', criminalRecord],
    [22, 'release', release],
  ])(
    'loads service %s by UID and locale headers',
    async (number, route, result) => {
      respond(result);
      const controller = new AbortController();
      await expect(
        fetchCitizenService(Number(number), params, controller.signal),
      ).resolves.toEqual({ number, result });
      expect(fetcher).toHaveBeenCalledWith(
        `https://citizen.test/api/v3/citizen/${route}`,
        {
          method: 'GET',
          signal: controller.signal,
          headers: { 'x-user-uuid': params.uid, 'x-app-lang': 'uz' },
        },
      );
    },
  );
  it('rejects invalid UID before any network request', async () => {
    await expect(
      fetchCitizenService(7, { ...params, uid: 'invalid' }),
    ).rejects.toMatchObject({ kind: 'validation' });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('rejects unsupported services without any network request', async () => {
    await expect(fetchCitizenService(99, params)).rejects.toMatchObject({
      status: 404,
    });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('rejects malformed response and preserves HTTP errors', async () => {
    respond({ isReleased: 'true', records: [] });
    await expect(fetchCitizenService(22, params)).rejects.toMatchObject({
      kind: 'validation',
    });
    fetcher.mockResolvedValue(new Response(null, { status: 401 }));
    await expect(fetchCitizenService(22, params)).rejects.toMatchObject({
      kind: 'http',
      status: 401,
    });
  });
  it('validates nullable fields without coercing term strings or allowing missing fields', () => {
    expect(residenceSchema.safeParse(residence).success).toBe(true);
    expect(residentsSchema.safeParse(residents).success).toBe(true);
    expect(criminalRecordSchema.safeParse(criminalRecord).success).toBe(true);
    expect(releaseSchema.safeParse(release).success).toBe(true);
    expect(
      releaseSchema.safeParse({
        ...release,
        records: [{ ...release.records[0], term: { ...term, months: 6 } }],
      }).success,
    ).toBe(false);
    expect(
      residenceSchema.safeParse({ ...residence, firstName: undefined }).success,
    ).toBe(false);
  });
});

describe('citizen identification transport', () => {
  it.each<IdentifyRequest>([
    { pinfl: '12345678901234' },
    { passportSerial: 'AA1234567', birthDate: '15.04.1990' },
  ])(
    'posts the confirmed request shape without interpreting its result',
    async (input) => {
      const result = { unconfirmedResult: { value: 'opaque' } };
      respond(result);
      const controller = new AbortController();
      await expect(identifyCitizen(input, controller.signal)).resolves.toEqual(
        result,
      );
      expect(fetcher).toHaveBeenCalledWith(
        'https://citizen.test/api/v3/citizen/identify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
          signal: controller.signal,
        },
      );
    },
  );
  it.each<IdentifyRequest>([
    { pinfl: '1234' },
    { passportSerial: 'aa1234567', birthDate: '15.04.1990' },
    { passportSerial: 'AA1234567', birthDate: '31.02.1990' },
    { passportSerial: 'AA1234567', birthDate: '29.02.2025' },
  ])('rejects invalid identification input before sending', async (input) => {
    await expect(identifyCitizen(input)).rejects.toMatchObject({
      kind: 'validation',
    });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('preserves HTTP failure and abort signals without exposing request data', async () => {
    fetcher.mockResolvedValue(new Response(null, { status: 500 }));
    await expect(
      identifyCitizen({ pinfl: '12345678901234' }),
    ).rejects.toMatchObject({ kind: 'http', status: 500 });
    const controller = new AbortController();
    fetcher.mockImplementation(
      async (_url, options) =>
        new Promise<Response>((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          );
        }),
    );
    const pending = identifyCitizen(
      { pinfl: '12345678901234' },
      controller.signal,
    );
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  });
});

describe('citizen service queries', () => {
  it('separates UID, language and service number cache keys', () => {
    expect(citizenServiceKeys.result(7, params)).not.toEqual(
      citizenServiceKeys.result(8, params),
    );
    expect(citizenServiceKeys.result(7, params)).not.toEqual(
      citizenServiceKeys.result(7, { ...params, uid: 'b'.repeat(64) }),
    );
    expect(citizenServiceKeys.result(7, params)).not.toEqual(
      citizenServiceKeys.result(7, { ...params, language: 'cr' }),
    );
  });
  it('does not request services until UID is available', () => {
    const { Wrapper, queryClient } = createWrapper();
    const { result, unmount } = renderHook(() => useCitizenService(7, null), {
      wrapper: Wrapper,
    });
    expect(result.current.fetchStatus).toBe('idle');
    expect(fetcher).not.toHaveBeenCalled();
    unmount();
    queryClient.clear();
  });
  it('marks personal results as session owned and aborts on unmount', async () => {
    const { Wrapper, queryClient } = createWrapper();
    let requestSignal: AbortSignal | null | undefined;
    fetcher.mockImplementation(async (_url, options) => {
      requestSignal = options?.signal;
      return new Promise<Response>((_resolve, reject) => {
        requestSignal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        );
      });
    });
    const { unmount } = renderHook(() => useCitizenService(7, params), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(fetcher).toHaveBeenCalledOnce());
    expect(queryClient.getQueryCache().getAll()[0]?.meta?.sessionOwned).toBe(
      true,
    );
    unmount();
    expect(requestSignal?.aborted).toBe(true);
    queryClient.clear();
  });
});
