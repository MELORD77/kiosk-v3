import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createOperatorCallController } from './operator-call-controller';
import type {
  OperatorCallApi,
  OperatorCallState,
} from './operator-call-controller';

const stop = vi.fn();
class TestStream {
  getTracks() {
    return [{ stop }];
  }
  getAudioTracks() {
    return this.getTracks();
  }
  addTrack() {}
}
class TestPeer {
  static current: TestPeer;
  connectionState: RTCPeerConnectionState = 'new';
  remoteDescription: RTCSessionDescriptionInit | null = null;
  onicecandidate: ((event: { candidate: null }) => void) | null = null;
  ontrack: (() => void) | null = null;
  onconnectionstatechange: (() => void) | null = null;
  close = vi.fn();
  addTrack = vi.fn();
  createOffer = vi.fn(async () => ({ type: 'offer', sdp: 'private-sdp' }));
  setLocalDescription = vi.fn(async () => undefined);
  setRemoteDescription = vi.fn(
    async (description: RTCSessionDescriptionInit) => {
      this.remoteDescription = description;
    },
  );
  addIceCandidate = vi.fn(async () => undefined);
  constructor() {
    TestPeer.current = this;
  }
}
const started = {
  ok: true as const,
  callId: 'private-id',
  token: 'private-token',
  expiresInSeconds: 300,
};
function setup() {
  const session = new AbortController();
  const api: OperatorCallApi = {
    start: vi.fn(async () => started),
    signal: vi.fn(async () => undefined),
    poll: vi.fn<OperatorCallApi['poll']>(async () => ({
      ok: true,
      callId: started.callId,
      state: 'ringing',
      sequence: 0,
      events: [],
    })),
    hangup: vi.fn(async () => undefined),
  };
  const onState = vi.fn<(state: OperatorCallState) => void>();
  const getMicrophone = vi.fn(async () => new MediaStream());
  const controller = createOperatorCallController({
    api,
    sessionSignal: session.signal,
    onState,
    runtime: {
      getMicrophone,
      createPeer: () => new RTCPeerConnection(),
      createStream: () => new MediaStream(),
    },
  });
  return { api, session, onState, getMicrophone, controller };
}
describe('operator call lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('MediaStream', TestStream);
    vi.stubGlobal('RTCPeerConnection', TestPeer);
    stop.mockClear();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
  it('prevents duplicate starts and closes audio, peer, timers and pending poll on session reset', async () => {
    const { controller, api, session, onState } = setup();
    await Promise.all([controller.start(), controller.start()]);
    expect(api.start).toHaveBeenCalledTimes(1);
    session.abort();
    expect(stop).toHaveBeenCalledTimes(1);
    expect(TestPeer.current.close).toHaveBeenCalledTimes(1);
    expect(api.hangup).toHaveBeenCalledWith({
      callId: started.callId,
      token: started.token,
    });
    expect(onState).toHaveBeenLastCalledWith({
      status: 'ended',
      error: null,
      remoteStream: null,
    });
    await vi.advanceTimersByTimeAsync(1000);
    expect(vi.getTimerCount()).toBe(0);
    controller.dispose();
  });
  it('stops microphone resolved after cancellation without starting a device call', async () => {
    const { controller, api, getMicrophone } = setup();
    let resolve: ((stream: MediaStream) => void) | undefined;
    getMicrophone.mockImplementationOnce(
      () =>
        new Promise((complete) => {
          resolve = complete;
        }),
    );
    const pending = controller.start();
    controller.hangup();
    resolve?.(new MediaStream());
    await pending;
    expect(stop).toHaveBeenCalledTimes(1);
    expect(api.start).not.toHaveBeenCalled();
    controller.dispose();
  });
  it('hangs up orphan credentials returned after cancellation', async () => {
    const { controller, api } = setup();
    let resolve: ((value: typeof started) => void) | undefined;
    vi.mocked(api.start).mockImplementationOnce(
      () =>
        new Promise((complete) => {
          resolve = complete;
        }),
    );
    const pending = controller.start();
    await vi.advanceTimersByTimeAsync(0);
    controller.hangup();
    resolve?.(started);
    await pending;
    expect(api.hangup).toHaveBeenCalledExactlyOnceWith(started);
    expect(stop).toHaveBeenCalledTimes(1);
    controller.dispose();
  });
  it('waits for an old instance hangup before starting a new device call', async () => {
    const first = setup();
    await first.controller.start();
    let finishHangup: (() => void) | undefined;
    vi.mocked(first.api.hangup).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishHangup = resolve;
        }),
    );
    first.controller.dispose();
    const second = setup();
    const pending = second.controller.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(second.api.start).not.toHaveBeenCalled();
    finishHangup?.();
    await pending;
    expect(second.api.start).toHaveBeenCalledTimes(1);
    second.controller.dispose();
  });
  it('buffers ICE until answer, creates one offer, and waits for actual peer connection', async () => {
    const { controller, api, onState } = setup();
    vi.mocked(api.poll).mockResolvedValueOnce({
      ok: true,
      callId: started.callId,
      state: 'connected',
      sequence: 4,
      events: [
        {
          sequence: 1,
          type: 'candidate',
          from: 'operator',
          to: 'kiosk',
          payload: JSON.stringify({
            candidate: 'private-ice',
            sdpMid: null,
            sdpMLineIndex: 0,
          }),
        },
        {
          sequence: 2,
          type: 'joined',
          from: 'operator',
          to: 'kiosk',
          payload: null,
        },
        {
          sequence: 3,
          type: 'joined',
          from: 'operator',
          to: 'kiosk',
          payload: null,
        },
        {
          sequence: 4,
          type: 'answer',
          from: 'operator',
          to: 'kiosk',
          payload: 'private-answer',
        },
      ],
    });
    await controller.start();
    await vi.advanceTimersByTimeAsync(0);
    const peer = TestPeer.current;
    expect(peer.createOffer).toHaveBeenCalledTimes(1);
    expect(peer.addIceCandidate).toHaveBeenCalledTimes(1);
    expect(onState).toHaveBeenLastCalledWith({
      status: 'connecting',
      error: null,
      remoteStream: null,
    });
    peer.connectionState = 'connected';
    peer.onconnectionstatechange?.();
    expect(onState).toHaveBeenLastCalledWith({
      status: 'connected',
      error: null,
      remoteStream: null,
    });
    controller.dispose();
  });
  it('expires ringing and releases resources', async () => {
    const { controller, api, onState } = setup();
    await controller.start();
    await vi.advanceTimersByTimeAsync(300_000);
    expect(onState).toHaveBeenLastCalledWith({
      status: 'error',
      error: 'connection_timeout',
      remoteStream: null,
    });
    expect(api.hangup).toHaveBeenCalledTimes(1);
    expect(stop).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    controller.dispose();
  });
  it('reports denied microphone access without creating a call', async () => {
    const { controller, api, getMicrophone, onState } = setup();
    getMicrophone.mockRejectedValueOnce(
      new DOMException('Private detail', 'NotAllowedError'),
    );
    await controller.start();
    expect(api.start).not.toHaveBeenCalled();
    expect(onState).toHaveBeenLastCalledWith({
      status: 'error',
      error: 'microphone_denied',
      remoteStream: null,
    });
    controller.dispose();
  });
  it('handles remote hangup without echoing another hangup request', async () => {
    const { controller, api, onState } = setup();
    vi.mocked(api.poll).mockResolvedValueOnce({
      ok: true,
      callId: started.callId,
      state: 'ended',
      sequence: 1,
      events: [
        {
          sequence: 1,
          type: 'hangup',
          from: 'server',
          to: 'kiosk',
          payload: null,
        },
      ],
    });
    await controller.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(onState).toHaveBeenLastCalledWith({
      status: 'ended',
      error: null,
      remoteStream: null,
    });
    expect(api.hangup).not.toHaveBeenCalled();
    expect(stop).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    controller.dispose();
  });
  it('marks a disconnected peer as connecting and ends after the recovery deadline', async () => {
    const { controller, onState } = setup();
    await controller.start();
    const peer = TestPeer.current;
    peer.connectionState = 'connected';
    peer.onconnectionstatechange?.();
    peer.connectionState = 'disconnected';
    peer.onconnectionstatechange?.();
    expect(onState).toHaveBeenLastCalledWith({
      status: 'connecting',
      error: null,
      remoteStream: null,
    });
    await vi.advanceTimersByTimeAsync(15_000);
    expect(onState).toHaveBeenLastCalledWith({
      status: 'error',
      error: 'connection_timeout',
      remoteStream: null,
    });
    controller.dispose();
  });
});
