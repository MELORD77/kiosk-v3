import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as SharedApi from '@/shared/api';

import {
  citizenServiceKeys,
  citizenDocumentInputSchema,
  citizenServiceRequestSchema,
} from './citizen-request';
import type { CitizenServiceRequest } from './citizen-request';
import {
  fetchCitizenService,
  useRequestCitizenService,
} from './citizen-service';
import { criminalRecordSchema } from './criminal-record';

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

const input: CitizenServiceRequest = {
  method: 'PASSPORT',
  passportSerial: 'AA1234567',
  birthDate: '15.04.1990',
  photo: 'data:image/jpeg;base64,/9j/AAAA',
};
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

describe('citizen service POST adapters', () => {
  it.each([
    [7, 'residence', residence],
    [8, 'residents', residents],
    [12, 'criminal-record', criminalRecord],
    [22, 'release', release],
  ])(
    'posts document and photo to service %s without UUID headers',
    async (number, route, result) => {
      respond(result);
      const controller = new AbortController();
      await expect(
        fetchCitizenService(Number(number), input, 'uz', controller.signal),
      ).resolves.toEqual({ number, result });
      expect(fetcher).toHaveBeenCalledExactlyOnceWith(
        `https://citizen.test/api/v3/citizen/${route}`,
        {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json', 'x-app-lang': 'uz' },
          body: JSON.stringify(input),
        },
      );
    },
  );

  it.each(['uz', 'cr', 'ru', 'en', 'kk'] as const)(
    'sends language %s and explicit PINFL method',
    async (language) => {
      respond(residents);
      const request: CitizenServiceRequest = {
        method: 'PINFL',
        pinfl: '12345678901234',
        photo: input.photo,
      };
      await fetchCitizenService(8, request, language);
      expect(fetcher).toHaveBeenCalledWith(
        'https://citizen.test/api/v3/citizen/residents',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'x-app-lang': language,
          },
          body: JSON.stringify(request),
        }),
      );
    },
  );

  it('rejects unsupported services without sending', async () => {
    await expect(fetchCitizenService(99, input, 'uz')).rejects.toMatchObject({
      status: 404,
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each([
    {
      method: 'PASSPORT',
      passportSerial: 'A11234567',
      birthDate: '15.04.1990',
    },
    {
      method: 'PASSPORT',
      passportSerial: 'AA1234567',
      birthDate: '31.02.1990',
    },
    {
      method: 'PASSPORT',
      passportSerial: 'AA1234567',
      birthDate: '29.02.2025',
    },
    { method: 'PINFL', pinfl: '1234' },
    { method: 'PINFL', pinfl: '12345678901234', passportSerial: 'AA1234567' },
    { method: 'ID_CARD', document: 'unknown' },
    { method: 'BIO_PASSPORT', document: 'unknown' },
    { passportSerial: 'AA1234567', birthDate: '15.04.1990' },
  ])('rejects incomplete or mixed document contracts', (document) => {
    expect(citizenDocumentInputSchema.safeParse(document).success).toBe(false);
    expect(
      citizenServiceRequestSchema.safeParse({ ...document, photo: input.photo })
        .success,
    ).toBe(false);
  });

  it('accepts a real leap day and rejects a photo in document-only input', () => {
    const document = {
      method: 'PASSPORT',
      passportSerial: 'AA1234567',
      birthDate: '29.02.2000',
    };
    expect(citizenDocumentInputSchema.safeParse(document).success).toBe(true);
    expect(
      citizenDocumentInputSchema.safeParse({ ...document, photo: input.photo })
        .success,
    ).toBe(false);
    expect(
      citizenDocumentInputSchema.safeParse({
        ...document,
        passportSerial: 'aa1234567',
      }).success,
    ).toBe(true);
  });

  it.each([
    '',
    'AAAA',
    'data:image/jpeg;base64,',
    'data:image/jpeg;base64,A',
    'data:image/jpeg;base64,A===',
    'data:image/png;base64,AAAA',
  ])('rejects malformed photo before sending', async (photo) => {
    await expect(
      fetchCitizenService(7, { ...input, photo }, 'uz'),
    ).rejects.toMatchObject({ kind: 'validation' });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('enforces 10 MiB on the whole body including document fields', async () => {
    const base64Length = Math.floor((10 * 1024 * 1024 - 22) / 4) * 4;
    await expect(
      fetchCitizenService(
        7,
        {
          ...input,
          photo: `data:image/jpeg;base64,${'A'.repeat(base64Length)}`,
        },
        'uz',
      ),
    ).rejects.toMatchObject({ kind: 'validation' });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('rejects malformed responses', async () => {
    respond({ isReleased: 'true', records: [] });
    await expect(fetchCitizenService(22, input, 'uz')).rejects.toMatchObject({
      kind: 'validation',
    });
  });

  it.each([400, 401, 403, 404, 422, 500, 501, 503])(
    'preserves HTTP %s with only the localized error message',
    async (status) => {
      const message = {
        uz: 'Uzbek',
        cr: 'Cyrillic',
        ru: 'Russian',
        en: 'English',
        kk: 'Karakalpak',
      };
      fetcher.mockResolvedValue(
        new Response(JSON.stringify({ message, result: input }), { status }),
      );
      const error = await fetchCitizenService(7, input, 'uz').catch(
        (failure: unknown) => failure,
      );
      expect(error).toMatchObject({
        kind: 'http',
        status,
        serverMessage: message,
      });
      expect(JSON.stringify(error)).not.toContain(input.photo);
      expect(JSON.stringify(error)).not.toContain('AA1234567');
    },
  );

  it('keeps unreadable errors as HTTP failures without request data', async () => {
    fetcher.mockResolvedValue(new Response('invalid JSON', { status: 500 }));
    await expect(fetchCitizenService(7, input, 'uz')).rejects.toMatchObject({
      kind: 'http',
      status: 500,
      serverMessage: undefined,
    });
  });

  it('preserves abort and does not send already aborted requests', async () => {
    const controller = new AbortController();
    fetcher.mockImplementation(
      async (_url, options) =>
        new Promise<Response>((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          );
        }),
    );
    const pending = fetchCitizenService(7, input, 'uz', controller.signal);
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    fetcher.mockClear();
    await expect(
      fetchCitizenService(7, input, 'uz', controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('preserves nullable response fields and term strings', () => {
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

describe('citizen service mutations', () => {
  it('does not request until explicitly submitted and does not retry or retain inactive personal results', async () => {
    fetcher.mockResolvedValue(new Response(null, { status: 500 }));
    const { Wrapper, queryClient } = createWrapper();
    const { result, unmount } = renderHook(() => useRequestCitizenService(), {
      wrapper: Wrapper,
    });
    expect(fetcher).not.toHaveBeenCalled();
    await expect(
      result.current.mutateAsync({ number: 7, input, language: 'uz' }),
    ).rejects.toMatchObject({ status: 500 });
    expect(fetcher).toHaveBeenCalledOnce();
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    const mutation = queryClient.getMutationCache().getAll()[0];
    expect(mutation?.options.mutationKey).toEqual(citizenServiceKeys.request());
    expect(mutation?.options.mutationKey).toEqual([
      'session',
      'citizen-service',
      'request',
    ]);
    expect(mutation?.meta?.sessionOwned).toBe(true);
    expect(mutation?.options.gcTime).toBe(0);
    unmount();
    await waitFor(() =>
      expect(queryClient.getMutationCache().getAll()).toHaveLength(0),
    );
    queryClient.clear();
  });
});
