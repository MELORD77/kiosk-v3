import { z } from 'zod';

import { createApiClient } from '@/shared/api';
import type { ApiRequestOptions } from '@/shared/api';
import { env } from '@/shared/config';

const hardwareErrorCodeSchema = z.enum([
  'not_configured',
  'device_failure',
  'no_document',
  'passport_reader_not_found',
  'reader_unavailable',
  'no_reader',
  'invalid_mrz',
  'origin_not_allowed',
  'timeout',
]);
export type HardwareErrorCode = z.infer<typeof hardwareErrorCodeSchema>;

export class HardwareError extends Error {
  readonly code: HardwareErrorCode;

  constructor(code: HardwareErrorCode) {
    super('The hardware operation could not be completed.');
    this.name = 'HardwareError';
    this.code = code;
  }
}

export const hardwareKeys = {
  all: ['session', 'kiosk-hardware'] as const,
  passportRead: () => [...hardwareKeys.all, 'passport-read'] as const,
};

const failureSchema = z.object({
  ok: z.literal(false),
  error: hardwareErrorCodeSchema.catch('device_failure'),
});

export async function requestHardware<T extends { ok: true }>(
  path: string,
  options: ApiRequestOptions<T>,
  timeoutMs = 10_000,
): Promise<T> {
  if (!env.hardwareApiBaseUrl) throw new HardwareError('not_configured');
  const controller = new AbortController();
  const cancel = () => controller.abort(options.signal?.reason);
  options.signal?.throwIfAborted();
  options.signal?.addEventListener('abort', cancel, { once: true });
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const useDevelopmentProxy =
      import.meta.env.DEV && import.meta.env.MODE !== 'test';
    const client = createApiClient(
      useDevelopmentProxy
        ? {}
        : {
            baseUrl: env.hardwareApiBaseUrl,
          },
    );
    const result = await client.request(
      useDevelopmentProxy ? `/device-api${path}` : path,
      {
        ...options,
        cache: 'no-store',
        credentials: 'omit',
        signal: controller.signal,
        schema: z.union([failureSchema, options.schema]),
      },
    );
    if (!result.ok) throw new HardwareError(result.error);
    return result;
  } catch (error) {
    options.signal?.throwIfAborted();
    if (timedOut) throw new HardwareError('timeout');
    throw error;
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', cancel);
  }
}
