import { z } from 'zod';

import { HardwareError } from '@/entities/kiosk-hardware';
import type {
  CallCredentials,
  CallPoll,
  CallSignalType,
  CallStarted,
  HardwareErrorCode,
} from '@/entities/kiosk-hardware';

export type OperatorCallStatus =
  | 'idle'
  | 'starting'
  | 'ringing'
  | 'connecting'
  | 'connected'
  | 'ended'
  | 'error';
export type OperatorCallErrorCode =
  | HardwareErrorCode
  | 'microphone_denied'
  | 'microphone_unavailable'
  | 'unsupported'
  | 'connection_failed'
  | 'connection_timeout'
  | 'network';
export interface OperatorCallState {
  status: OperatorCallStatus;
  error: OperatorCallErrorCode | null;
  remoteStream: MediaStream | null;
}
export interface OperatorCallApi {
  start: () => Promise<CallStarted>;
  signal: (
    credentials: CallCredentials,
    type: CallSignalType,
    payload: string,
    signal: AbortSignal,
  ) => Promise<unknown>;
  poll: (
    credentials: CallCredentials,
    after: number,
    signal: AbortSignal,
  ) => Promise<CallPoll>;
  hangup: (credentials: CallCredentials) => Promise<void>;
}
export interface OperatorCallRuntime {
  getMicrophone: () => Promise<MediaStream>;
  createPeer: () => RTCPeerConnection;
  createStream: () => MediaStream;
}
interface Dependencies {
  api: OperatorCallApi;
  runtime: OperatorCallRuntime;
  onState: (state: OperatorCallState) => void;
  sessionSignal: AbortSignal;
}
const candidateSchema = z.object({
  candidate: z.string().optional(),
  sdpMid: z.string().nullable().optional(),
  sdpMLineIndex: z.number().int().nonnegative().nullable().optional(),
  usernameFragment: z.string().nullable().optional(),
});
const stopStream = (stream: MediaStream | null) =>
  stream?.getTracks().forEach((track) => track.stop());

let lifecycleTail: Promise<void> = Promise.resolve();

export function createOperatorCallController(deps: Dependencies) {
  let state: OperatorCallState = {
    status: 'idle',
    error: null,
    remoteStream: null,
  };
  let generation = 0;
  let disposed = false;
  let starting = false;
  let credentials: CallCredentials | null = null;
  let localStream: MediaStream | null = null;
  let peer: RTCPeerConnection | null = null;
  let requestController = new AbortController();
  let deadline: ReturnType<typeof setTimeout> | undefined;
  let pollTimer: ReturnType<typeof setTimeout> | undefined;
  let queue: Promise<void> = Promise.resolve();
  let sequence = 0;
  let offered = false;
  let candidates: RTCIceCandidateInit[] = [];

  function publish(update: Partial<OperatorCallState>) {
    state = { ...state, ...update };
    if (!disposed) deps.onState(state);
  }
  function active(id: number) {
    return id === generation && !disposed && !deps.sessionSignal.aborted;
  }
  function end(
    status: 'ended' | 'error',
    error: OperatorCallErrorCode | null = null,
    notifyServer = true,
  ) {
    generation += 1;
    clearTimeout(deadline);
    clearTimeout(pollTimer);
    requestController.abort();
    if (peer) {
      peer.onicecandidate = null;
      peer.ontrack = null;
      peer.onconnectionstatechange = null;
      peer.close();
      peer = null;
    }
    stopStream(localStream);
    stopStream(state.remoteStream);
    localStream = null;
    candidates = [];
    const previous = credentials;
    credentials = null;
    publish({ status, error, remoteStream: null });
    if (notifyServer && previous) {
      const teardown = deps.api.hangup(previous).catch(() => undefined);
      lifecycleTail = Promise.all([lifecycleTail, teardown]).then(
        () => undefined,
      );
    }
  }
  function fail(error: unknown, id: number) {
    if (!active(id)) return;
    let code: OperatorCallErrorCode = 'network';
    if (error instanceof HardwareError) code = error.code;
    else if (error instanceof DOMException) {
      code =
        state.status === 'starting'
          ? error.name === 'NotSupportedError'
            ? 'unsupported'
            : error.name === 'NotAllowedError'
              ? 'microphone_denied'
              : 'microphone_unavailable'
          : 'connection_failed';
    }
    end('error', code);
  }
  function enqueue(operation: () => Promise<void>, id: number) {
    queue = queue
      .then(async () => {
        if (active(id)) await operation();
      })
      .catch((error: unknown) => fail(error, id));
    return queue;
  }
  function send(type: CallSignalType, payload: string, id: number) {
    return enqueue(async () => {
      if (credentials)
        await deps.api.signal(
          credentials,
          type,
          payload,
          requestController.signal,
        );
    }, id);
  }
  function connectionDeadline(id: number, duration: number) {
    clearTimeout(deadline);
    deadline = setTimeout(() => {
      if (active(id)) end('error', 'connection_timeout');
    }, duration);
  }
  async function processEvents(result: CallPoll, id: number) {
    if (!active(id)) return;
    if (
      !credentials ||
      result.callId !== credentials.callId ||
      result.sequence < sequence
    )
      throw new HardwareError('call_sequence_invalid');
    if (result.state === 'ended') {
      end('ended', null, false);
      return;
    }
    let highestSequence = sequence;
    for (const event of result.events) {
      if (event.sequence > result.sequence)
        throw new HardwareError('call_sequence_invalid');
      if (event.sequence <= sequence) continue;
      if (event.sequence <= highestSequence)
        throw new HardwareError('call_sequence_invalid');
      highestSequence = event.sequence;
    }
    for (const event of result.events) {
      if (!active(id)) return;
      if (event.sequence <= sequence) continue;
      if (event.type === 'hangup') {
        end('ended', null, false);
        return;
      }
      const connection = peer;
      if (!connection) return;
      if (event.type === 'joined' && !offered) {
        offered = true;
        publish({ status: 'connecting' });
        connectionDeadline(id, 30_000);
        const offer = await connection.createOffer();
        if (!active(id)) return;
        await connection.setLocalDescription(offer);
        if (!active(id)) return;
        if (!offer.sdp) throw new HardwareError('call_signal_invalid');
        if (credentials)
          await deps.api.signal(
            credentials,
            'offer',
            offer.sdp,
            requestController.signal,
          );
      } else if (event.type === 'answer') {
        if (!offered || !event.payload)
          throw new HardwareError('call_signal_invalid');
        await connection.setRemoteDescription({
          type: 'answer',
          sdp: event.payload,
        });
        if (!active(id)) return;
        for (const candidate of candidates) {
          await connection.addIceCandidate(candidate);
          if (!active(id)) return;
        }
        candidates = [];
      } else if (event.type === 'candidate') {
        if (!event.payload) throw new HardwareError('call_signal_invalid');
        let raw: unknown;
        try {
          raw = JSON.parse(event.payload);
        } catch {
          throw new HardwareError('call_signal_invalid');
        }
        const parsed = candidateSchema.safeParse(raw);
        if (!parsed.success) throw new HardwareError('call_signal_invalid');
        if (connection.remoteDescription)
          await connection.addIceCandidate(parsed.data);
        else candidates.push(parsed.data);
      }
      sequence = event.sequence;
    }
    sequence = result.sequence;
  }
  async function poll(id: number) {
    await enqueue(async () => {
      if (!credentials) return;
      const result = await deps.api.poll(
        credentials,
        sequence,
        requestController.signal,
      );
      await processEvents(result, id);
    }, id);
    if (active(id)) pollTimer = setTimeout(() => void poll(id), 1000);
  }
  async function start() {
    if (
      disposed ||
      deps.sessionSignal.aborted ||
      starting ||
      credentials ||
      peer
    )
      return;
    starting = true;
    const id = ++generation;
    requestController = new AbortController();
    sequence = 0;
    offered = false;
    queue = Promise.resolve();
    publish({ status: 'starting', error: null, remoteStream: null });
    let releaseCreation: (() => void) | undefined;
    try {
      const stream = await deps.runtime.getMicrophone();
      if (!active(id)) {
        stopStream(stream);
        return;
      }
      localStream = stream;
      const previousLifecycle = lifecycleTail;
      lifecycleTail = new Promise<void>((resolve) => {
        releaseCreation = resolve;
      });
      await previousLifecycle;
      if (!active(id)) return;
      const started = await deps.api.start();
      if (!active(id)) {
        await deps.api.hangup(started).catch(() => undefined);
        return;
      }
      credentials = { callId: started.callId, token: started.token };
      const connection = deps.runtime.createPeer();
      peer = connection;
      for (const track of stream.getAudioTracks())
        connection.addTrack(track, stream);
      connection.onicecandidate = (event) => {
        if (event.candidate && active(id))
          void send('candidate', JSON.stringify(event.candidate.toJSON()), id);
      };
      connection.ontrack = (event) => {
        if (!active(id)) return;
        const remote = state.remoteStream ?? deps.runtime.createStream();
        if (!remote.getTracks().includes(event.track))
          remote.addTrack(event.track);
        publish({ remoteStream: remote });
      };
      connection.onconnectionstatechange = () => {
        if (!active(id)) return;
        if (connection.connectionState === 'connected') {
          clearTimeout(deadline);
          publish({ status: 'connected' });
          void send('connected', '', id);
        } else if (
          connection.connectionState === 'failed' ||
          connection.connectionState === 'closed'
        )
          end('error', 'connection_failed');
        else if (
          connection.connectionState === 'disconnected' &&
          state.status === 'connected'
        ) {
          publish({ status: 'connecting' });
          connectionDeadline(id, 15_000);
        }
      };
      publish({ status: 'ringing' });
      connectionDeadline(id, started.expiresInSeconds * 1000);
      void poll(id);
    } catch (error) {
      fail(error, id);
    } finally {
      releaseCreation?.();
      starting = false;
    }
  }
  const hangup = () => end('ended');
  deps.sessionSignal.addEventListener('abort', hangup, { once: true });
  return {
    start,
    hangup,
    dispose() {
      disposed = true;
      deps.sessionSignal.removeEventListener('abort', hangup);
      end('ended');
    },
  };
}
