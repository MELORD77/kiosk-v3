import { z } from 'zod';

import { requestHardware } from './hardware-request';

const stateSchema = z.enum(['ringing', 'connecting', 'connected', 'ended']);
const credentialsSchema = z.object({
  callId: z.string().min(1),
  token: z.string().min(1),
});
export type CallCredentials = z.infer<typeof credentialsSchema>;
const startSchema = credentialsSchema
  .extend({
    ok: z.literal(true),
    code: z.string().regex(/^\d{6}$/),
    state: z.literal('ringing'),
    expiresInSeconds: z.number().int().positive().max(3600),
    operatorPath: z.string(),
  })
  .transform(({ callId, token, expiresInSeconds }) => ({
    ok: true as const,
    callId,
    token,
    expiresInSeconds,
  }));
export type CallStarted = z.infer<typeof startSchema>;
const signalSchema = z.object({
  ok: z.literal(true),
  sequence: z.number().int().nonnegative(),
  state: stateSchema,
});
const pollSchema = z.object({
  ok: z.literal(true),
  callId: z.string().min(1),
  state: stateSchema,
  sequence: z.number().int().nonnegative(),
  events: z.array(
    z.object({
      sequence: z.number().int().positive(),
      type: z.enum([
        'joined',
        'offer',
        'answer',
        'candidate',
        'connected',
        'hangup',
      ]),
      from: z.string(),
      to: z.string(),
      payload: z.string().nullable(),
    }),
  ),
});
export type CallPoll = z.infer<typeof pollSchema>;
export type CallSignalType = 'offer' | 'answer' | 'candidate' | 'connected';

function post<T extends { ok: true }>(
  path: string,
  body: unknown,
  schema: z.ZodType<T>,
  signal?: AbortSignal,
) {
  return requestHardware(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    schema,
    signal,
  });
}

export function startOperatorCall(): Promise<CallStarted> {
  // Keep start independent of UI cancellation so a late successful call can be ended.
  return post('/api/call/start', {}, startSchema);
}
export function signalOperatorCall(
  credentials: CallCredentials,
  type: CallSignalType,
  payload: string,
  signal?: AbortSignal,
) {
  return post(
    '/api/call/signal',
    { callId: credentials.callId, token: credentials.token, type, payload },
    signalSchema,
    signal,
  );
}
export function pollOperatorCall(
  credentials: CallCredentials,
  after: number,
  signal?: AbortSignal,
): Promise<CallPoll> {
  return post(
    '/api/call/poll',
    { callId: credentials.callId, token: credentials.token, after },
    pollSchema,
    signal,
  );
}
export async function hangupOperatorCall(
  credentials: CallCredentials,
): Promise<void> {
  await post(
    '/api/call/hangup',
    { callId: credentials.callId, token: credentials.token },
    z.object({ ok: z.literal(true), state: z.literal('ended') }),
  );
}
