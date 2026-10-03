import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { demoProfileKeys, useSubmitDemoLabel } from './demo-profiles';

function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return { queryClient, Wrapper };
}

describe('development demo mutation', () => {
  it('invalidates only demo profile queries after success', async () => {
    vi.useFakeTimers();
    const { queryClient, Wrapper } = createQueryWrapper();
    queryClient.setQueryData(demoProfileKeys.list('success'), []);
    queryClient.setQueryData(['unrelated'], 'retained');
    const { result, unmount } = renderHook(() => useSubmitDemoLabel(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      const submission = result.current.mutateAsync({ label: 'Kiosk' });
      await vi.advanceTimersByTimeAsync(150);
      await submission;
    });

    expect(
      queryClient.getQueryState(demoProfileKeys.list('success'))?.isInvalidated,
    ).toBe(true);
    expect(queryClient.getQueryState(['unrelated'])?.isInvalidated).toBe(false);
    unmount();
    queryClient.clear();
  });

  it('aborts a session-owned mutation without invalidating its queries', async () => {
    const { queryClient, Wrapper } = createQueryWrapper();
    const controller = new AbortController();
    queryClient.setQueryData(demoProfileKeys.list('success'), []);
    const { result, unmount } = renderHook(
      () => useSubmitDemoLabel(controller.signal),
      {
        wrapper: Wrapper,
      },
    );

    await act(async () => {
      const assertion = expect(
        result.current.mutateAsync({ label: 'Kiosk' }),
      ).rejects.toMatchObject({
        name: 'AbortError',
      });
      controller.abort();
      await assertion;
    });

    expect(
      queryClient.getQueryState(demoProfileKeys.list('success'))?.isInvalidated,
    ).toBe(false);
    unmount();
    queryClient.clear();
  });
});
