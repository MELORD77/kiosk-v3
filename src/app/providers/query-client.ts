import { QueryClient } from '@tanstack/react-query';
import { isRetryableApiError } from '@/shared/api';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: (count, error) => count < 1 && isRetryableApiError(error),
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  });
}

export function clearSessionCache(client: QueryClient) {
  const filters = {
    predicate: (query: { meta?: Record<string, unknown> }) =>
      query.meta?.sessionOwned === true,
  };
  void client.cancelQueries(filters);
  client.removeQueries(filters);
  const mutations = client.getMutationCache();
  mutations
    .getAll()
    .filter((mutation) => mutation.meta?.sessionOwned === true)
    .forEach((mutation) => mutations.remove(mutation));
}
