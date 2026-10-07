import { QueryClient } from '@tanstack/react-query';
import { isRetryableApiError } from '@/shared/api';
export { clearSessionCache } from '@/shared/lib/query-session';

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
