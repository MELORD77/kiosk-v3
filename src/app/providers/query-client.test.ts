import { describe, expect, it } from 'vitest';
import { clearSessionCache, createQueryClient } from './query-client';

describe('session cache', () => {
  it('cancels/removes session data while keeping public cached data', async () => {
    const client = createQueryClient();
    await client.fetchQuery({
      queryKey: ['session-profile'],
      queryFn: () => ({ name: 'Demo' }),
      meta: { sessionOwned: true },
    });
    await client.fetchQuery({
      queryKey: ['public'],
      queryFn: () => ['public'],
    });
    const cache = client.getMutationCache();
    cache.build(client, {
      mutationKey: ['session-submit'],
      meta: { sessionOwned: true },
    });
    clearSessionCache(client);
    expect(client.getQueryData(['session-profile'])).toBeUndefined();
    expect(client.getQueryData(['public'])).toEqual(['public']);
    expect(cache.getAll()).toHaveLength(0);
    client.clear();
  });
});
