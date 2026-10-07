import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  hangupOperatorCall,
  pollOperatorCall,
  signalOperatorCall,
  startOperatorCall,
} from './operator-call';

vi.mock('@/shared/config', () => ({
  env: { hardwareApiBaseUrl: 'http://hardware.test' },
}));
const fetcher = vi.fn<typeof fetch>();
describe('operator call transport', () => {
  beforeEach(() => {
    fetcher.mockReset();
    vi.stubGlobal('fetch', fetcher);
  });
  afterEach(() => vi.unstubAllGlobals());
  it('validates and discards the pairing code, and sends credentials only in POST bodies', async () => {
    fetcher.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          ok: true,
          callId: 'private-id',
          token: 'private-token',
          code: '123456',
          state: 'ringing',
          expiresInSeconds: 300,
          operatorPath: '/operator',
        }),
      ),
    );
    const started = await startOperatorCall();
    expect(started).toEqual({
      ok: true,
      callId: 'private-id',
      token: 'private-token',
      expiresInSeconds: 300,
    });
    fetcher.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ ok: true, sequence: 1, state: 'connecting' }),
      ),
    );
    await signalOperatorCall(started, 'offer', 'private-sdp');
    expect(fetcher).toHaveBeenLastCalledWith(
      'http://hardware.test/api/call/signal',
      expect.objectContaining({
        method: 'POST',
        cache: 'no-store',
        credentials: 'omit',
        body: JSON.stringify({
          callId: started.callId,
          token: started.token,
          type: 'offer',
          payload: 'private-sdp',
        }),
      }),
    );
  });
  it.each([200, 409])(
    'preserves call errors at HTTP %s without exposing server messages',
    async (status) => {
      fetcher.mockResolvedValue(
        new Response(
          JSON.stringify({
            ok: false,
            error: 'call_busy',
            message: 'private detail',
          }),
          { status },
        ),
      );
      await expect(startOperatorCall()).rejects.toMatchObject({
        code: 'call_busy',
        message: 'The hardware operation could not be completed.',
      });
    },
  );
  it('rejects malformed pairing response and validates poll and hangup', async () => {
    fetcher.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          ok: true,
          callId: 'id',
          token: 'token',
          code: 'bad',
          state: 'ringing',
          expiresInSeconds: 300,
          operatorPath: '/operator',
        }),
      ),
    );
    await expect(startOperatorCall()).rejects.toMatchObject({
      kind: 'validation',
    });
    fetcher.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          ok: true,
          callId: 'id',
          sequence: 2,
          state: 'connecting',
          events: [
            {
              sequence: 2,
              type: 'hangup',
              from: 'server',
              to: 'kiosk',
              payload: null,
            },
          ],
        }),
      ),
    );
    const credentials = { callId: 'id', token: 'token' };
    expect((await pollOperatorCall(credentials, 0)).events[0]?.type).toBe(
      'hangup',
    );
    fetcher.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true, state: 'ended' })),
    );
    await expect(hangupOperatorCall(credentials)).resolves.toBeUndefined();
  });
});
