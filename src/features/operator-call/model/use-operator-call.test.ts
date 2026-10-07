import { createElement } from 'react';
import type { ReactNode } from 'react';
import {
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useOperatorCall } from './use-operator-call';

vi.mock('@/shared/config', () => ({
  env: { hardwareApiBaseUrl: 'http://hardware.test' },
}));
const fetcher = vi.fn<typeof fetch>();
const stop = vi.fn();
class TestStream {
  getTracks() {
    return [{ stop }];
  }
  getAudioTracks() {
    return this.getTracks();
  }
}
class TestPeer {
  static current: TestPeer;
  onicecandidate = null;
  ontrack = null;
  onconnectionstatechange = null;
  close = vi.fn();
  addTrack = vi.fn();
  constructor() {
    TestPeer.current = this;
  }
}
const getUserMedia = vi.fn(async () => new MediaStream());
function wrapperFor(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

describe('operator call hook mutation lifecycle', () => {
  beforeEach(() => {
    fetcher.mockReset();
    getUserMedia.mockClear();
    stop.mockClear();
    vi.stubGlobal('fetch', fetcher);
    vi.stubGlobal('MediaStream', TestStream);
    vi.stubGlobal('RTCPeerConnection', TestPeer);
    vi.stubGlobal('isSecureContext', true);
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
    onlineManager.setOnline(false);
  });
  afterEach(() => {
    onlineManager.setOnline(true);
    vi.unstubAllGlobals();
  });

  it('runs LAN calls and independent teardown while offline, then removes sensitive mutation results', async () => {
    const client = new QueryClient({
      defaultOptions: { mutations: { retry: 3 } },
    });
    const session = new AbortController();
    const keys: unknown[] = [];
    const unsubscribe = client.getMutationCache().subscribe((event) => {
      if (event.type !== 'added') return;
      keys.push(event.mutation.options.mutationKey);
      expect(event.mutation.options).toMatchObject({
        retry: false,
        networkMode: 'always',
        gcTime: 0,
        meta: { sessionOwned: true },
      });
    });
    fetcher.mockImplementation(async (url, options) => {
      if (url === 'http://hardware.test/api/call/start') {
        return new Response(
          JSON.stringify({
            ok: true,
            callId: 'private-call-id',
            token: 'private-token',
            code: '123456',
            state: 'ringing',
            expiresInSeconds: 300,
            operatorPath: '/operator',
          }),
        );
      }
      if (url === 'http://hardware.test/api/call/poll') {
        return new Promise<Response>((_resolve, reject) => {
          options?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          );
        });
      }
      if (url === 'http://hardware.test/api/call/hangup') {
        expect(options?.signal?.aborted).toBe(false);
        expect(options?.body).toBe(
          JSON.stringify({ callId: 'private-call-id', token: 'private-token' }),
        );
        return new Response(JSON.stringify({ ok: true, state: 'ended' }));
      }
      throw new Error('Unexpected request');
    });
    const hook = renderHook(() => useOperatorCall(session.signal), {
      wrapper: wrapperFor(client),
    });
    await act(async () => {
      await hook.result.current.start();
    });
    expect(getUserMedia).toHaveBeenCalledExactlyOnceWith({
      audio: true,
      video: false,
    });
    expect(hook.result.current.status).toBe('ringing');
    expect(hook.result.current).not.toHaveProperty('code');
    await waitFor(() =>
      expect(fetcher.mock.calls.map(([url]) => url)).toContain(
        'http://hardware.test/api/call/poll',
      ),
    );
    expect(
      client
        .getMutationCache()
        .getAll()
        .every((mutation) => mutation.state.data === undefined),
    ).toBe(true);
    hook.unmount();
    await waitFor(() =>
      expect(fetcher.mock.calls.map(([url]) => url)).toContain(
        'http://hardware.test/api/call/hangup',
      ),
    );
    await waitFor(() =>
      expect(client.getMutationCache().getAll()).toHaveLength(0),
    );
    expect(stop).toHaveBeenCalledTimes(1);
    expect(TestPeer.current.close).toHaveBeenCalledTimes(1);
    expect(keys).toEqual([
      ['session', 'kiosk-hardware', 'operator-call', 'start'],
      ['session', 'kiosk-hardware', 'operator-call', 'poll'],
      ['session', 'kiosk-hardware', 'operator-call', 'hangup'],
    ]);
    const serializedKeys = JSON.stringify(keys);
    expect(serializedKeys).not.toContain('private-call-id');
    expect(serializedKeys).not.toContain('private-token');
    expect(serializedKeys).not.toContain('123456');
    unsubscribe();
    client.clear();
  });

  it('never retries a failed start even when query defaults allow retries and the browser is offline', async () => {
    const client = new QueryClient({
      defaultOptions: { mutations: { retry: 3, retryDelay: 0 } },
    });
    const session = new AbortController();
    fetcher.mockRejectedValue(new TypeError('Private network detail'));
    const hook = renderHook(() => useOperatorCall(session.signal), {
      wrapper: wrapperFor(client),
    });
    await act(async () => {
      await hook.result.current.start();
    });
    expect(hook.result.current.status).toBe('error');
    expect(hook.result.current.error).toBe('network');
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(stop).toHaveBeenCalledTimes(1);
    expect(client.getMutationCache().getAll()).toHaveLength(0);
    hook.unmount();
    client.clear();
  });
});
