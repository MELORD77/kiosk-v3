import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import {
  hangupOperatorCall,
  hardwareKeys,
  pollOperatorCall,
  signalOperatorCall,
  startOperatorCall,
} from '@/entities/kiosk-hardware';

import { createOperatorCallController } from './operator-call-controller';
import type { OperatorCallState } from './operator-call-controller';

export function useOperatorCall(sessionSignal: AbortSignal) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<OperatorCallState>({
    status: 'idle',
    error: null,
    remoteStream: null,
  });
  const controller = useRef<ReturnType<
    typeof createOperatorCallController
  > | null>(null);

  useEffect(() => {
    async function operation<T>(
      name: Parameters<typeof hardwareKeys.operatorCall>[0],
      execute: () => Promise<T>,
    ): Promise<T> {
      const cache = queryClient.getMutationCache();
      const mutation = cache.build(queryClient, {
        mutationKey: hardwareKeys.operatorCall(name),
        mutationFn: execute,
        retry: false,
        networkMode: 'always',
        gcTime: 0,
        meta: { sessionOwned: true },
      });
      try {
        return await mutation.execute(undefined);
      } finally {
        cache.remove(mutation);
      }
    }
    const instance = createOperatorCallController({
      sessionSignal,
      onState: setState,
      runtime: {
        getMicrophone: async () => {
          if (
            !globalThis.isSecureContext ||
            !navigator.mediaDevices?.getUserMedia ||
            typeof RTCPeerConnection === 'undefined'
          ) {
            throw new DOMException(
              'Audio calls are unavailable.',
              'NotSupportedError',
            );
          }
          return navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });
        },
        createPeer: () => new RTCPeerConnection({ iceServers: [] }),
        createStream: () => new MediaStream(),
      },
      api: {
        start: () => operation('start', startOperatorCall),
        poll: (credentials, after, signal) =>
          operation('poll', () => pollOperatorCall(credentials, after, signal)),
        signal: (credentials, type, payload, signal) =>
          operation('signal', () =>
            signalOperatorCall(credentials, type, payload, signal),
          ),
        hangup: (credentials) =>
          operation('hangup', () => hangupOperatorCall(credentials)),
      },
    });
    controller.current = instance;
    return () => {
      controller.current = null;
      instance.dispose();
    };
  }, [queryClient, sessionSignal]);

  const start = useCallback(async () => {
    await controller.current?.start();
  }, []);
  const hangup = useCallback(() => {
    controller.current?.hangup();
  }, []);
  return { ...state, start, hangup };
}
