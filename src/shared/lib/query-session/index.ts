import type { QueryClient } from '@tanstack/react-query';

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
