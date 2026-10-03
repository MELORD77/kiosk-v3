import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api';
import type * as SharedApi from '@/shared/api';

import type { ServiceSummary } from '../model/service-catalog';
import { localizedCatalogName } from '../model/service-catalog';
import { fetchService, useService } from './service';
import {
  fetchServiceCategories,
  serviceCategoryKeys,
} from './service-categories';
import { fetchServices, serviceKeys, useServices } from './services';

const { fetcher } = vi.hoisted(() => ({ fetcher: vi.fn<typeof fetch>() }));

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedApi>();
  return {
    ...actual,
    apiClient: actual.createApiClient({
      baseUrl: 'https://catalog.test',
      fetcher,
    }),
  };
});

const service: ServiceSummary = {
  id: '3e9a6762-6efa-4cb5-addd-b11057397e0c',
  number: 12,
  category: 'cert',
  lang: { uz: 'Latin', cr: 'Cyrillic', ru: 'Russian', en: 'English' },
};

function respond(result: unknown) {
  fetcher.mockImplementation(
    async () =>
      new Response(
        JSON.stringify({
          message: 'Success',
          result,
          meta: null,
          time: '2026-10-02T10:19:59.186Z',
        }),
      ),
  );
}

function createQueryWrapper() {
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

describe('service catalog adapters', () => {
  it('unwraps categories and preserves backend order and counts', async () => {
    const categories = [
      { key: 'road', lang: service.lang, servicesCount: 9 },
      { key: 'cert', lang: service.lang, servicesCount: 2 },
    ];
    const controller = new AbortController();
    respond(categories);

    await expect(fetchServiceCategories(controller.signal)).resolves.toEqual(
      categories,
    );
    expect(fetcher).toHaveBeenCalledWith(
      'https://catalog.test/api/v3/services/categories',
      { method: 'GET', signal: controller.signal },
    );
  });

  it('unwraps service lists without sorting or adding query parameters', async () => {
    const services = [service, { ...service, number: 2 }];
    const controller = new AbortController();
    respond(services);

    await expect(fetchServices('cert', controller.signal)).resolves.toEqual(
      services,
    );
    expect(fetcher).toHaveBeenCalledWith(
      'https://catalog.test/api/v3/services?category=cert',
      { method: 'GET', signal: controller.signal },
    );
  });

  it.each([undefined, '', '   '])(
    'omits empty category filters: %s',
    async (category) => {
      respond([]);

      await expect(fetchServices(category)).resolves.toEqual([]);
      expect(fetcher).toHaveBeenCalledWith(
        'https://catalog.test/api/v3/services',
        { method: 'GET', signal: undefined },
      );
      expect(serviceKeys.list(category)).toEqual(serviceKeys.list());
    },
  );

  it('encodes category input as one parameter', async () => {
    respond([]);

    await fetchServices('road&extra=value');
    expect(fetcher).toHaveBeenCalledWith(
      'https://catalog.test/api/v3/services?category=road%26extra%3Dvalue',
      { method: 'GET', signal: undefined },
    );
  });

  it('loads a service by its backend UUID', async () => {
    respond(service);
    const controller = new AbortController();

    await expect(fetchService(service.id, controller.signal)).resolves.toEqual(
      service,
    );
    expect(fetcher).toHaveBeenCalledWith(
      `https://catalog.test/api/v3/services/${service.id}`,
      { method: 'GET', signal: controller.signal },
    );
  });

  it('maps an invalid detail ID to not found without sending a request', async () => {
    await expect(fetchService('service-1')).rejects.toMatchObject({
      kind: 'http',
      status: 404,
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each([400, 404, 503])('preserves HTTP error %s', async (status) => {
    fetcher.mockResolvedValue(new Response(null, { status }));

    await expect(fetchService(service.id)).rejects.toMatchObject({
      kind: 'http',
      status,
    });
  });

  it.each([
    { ...service, id: 'service-1' },
    { ...service, number: 1.5 },
    { ...service, lang: { uz: 'Latin', ru: 'Russian', en: 'English' } },
  ])('rejects malformed service responses', async (invalidService) => {
    respond(invalidService);

    await expect(fetchService(service.id)).rejects.toMatchObject({
      kind: 'validation',
    });
  });

  it('rejects malformed category counts', async () => {
    respond([{ key: 'cert', lang: service.lang, servicesCount: '2' }]);

    await expect(fetchServiceCategories()).rejects.toMatchObject({
      kind: 'validation',
    });
  });

  it.each([
    ['uz', 'Latin'],
    ['uzc', 'Cyrillic'],
    ['cr', 'Cyrillic'],
    ['ru', 'Russian'],
    ['en', 'English'],
    ['unknown', 'Latin'],
  ])('resolves locale %s safely', (locale, name) => {
    expect(localizedCatalogName(service.lang, locale)).toBe(name);
  });
});

describe('service catalog queries', () => {
  it('keeps category results separate in the public cache', async () => {
    const { queryClient, Wrapper } = createQueryWrapper();
    respond([service]);
    const { result, rerender, unmount } = renderHook(
      ({ category }) => useServices(category),
      { initialProps: { category: 'cert' }, wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    respond([]);
    rerender({ category: 'road' });
    await waitFor(() => expect(result.current.data).toEqual([]));

    expect(queryClient.getQueryData(serviceKeys.list('cert'))).toEqual([
      service,
    ]);
    expect(queryClient.getQueryData(serviceKeys.list('road'))).toEqual([]);
    expect(
      queryClient.getQueryCache().find({ queryKey: serviceKeys.list('cert') })
        ?.meta?.sessionOwned,
    ).not.toBe(true);
    expect(serviceCategoryKeys.list()).not.toEqual(serviceKeys.list());
    unmount();
    queryClient.clear();
  });

  it('exposes not found for an invalid detail route without a request', async () => {
    const { queryClient, Wrapper } = createQueryWrapper();
    const { result, unmount } = renderHook(() => useService('service-1'), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect(result.current.error).toMatchObject({ status: 404 });
    expect(fetcher).not.toHaveBeenCalled();
    unmount();
    queryClient.clear();
  });

  it('aborts the request when its query is no longer observed', async () => {
    const { queryClient, Wrapper } = createQueryWrapper();
    let requestSignal: AbortSignal | null | undefined;
    fetcher.mockImplementation(async (_url, options) => {
      requestSignal = options?.signal;
      return new Promise<Response>((_resolve, reject) => {
        requestSignal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        );
      });
    });
    const { unmount } = renderHook(() => useServices(), { wrapper: Wrapper });

    await waitFor(() => expect(fetcher).toHaveBeenCalledOnce());
    expect(requestSignal?.aborted).toBe(false);
    unmount();
    expect(requestSignal?.aborted).toBe(true);
    queryClient.clear();
  });
});
