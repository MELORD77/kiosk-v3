import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import {
  HardwareError,
  hardwareKeys,
  requestHardware,
} from './hardware-request';

const passportMrzSchema = z.object({
  ok: z.boolean(),
  allChecksOk: z.boolean(),
  format: z.enum(['TD1', 'TD2', 'TD3']),
  documentType: z.string(),
  issuingCountry: z.string(),
  fullName: z.string().min(1),
  passportNumber: z.string().min(1),
  nationality: z.string(),
  birthDate: z.string(),
  sex: z.string(),
  expiryDate: z.string(),
  personalNumber: z.string().nullable(),
});
export type PassportMrz = z.infer<typeof passportMrzSchema>;

const passportReadSchema = z.object({
  ok: z.literal(true),
  mrz: z.union([z.object({ ok: z.literal(false) }), passportMrzSchema]),
});

const passportInfoSchema = z.object({
  ok: z.literal(true),
  port: z.string().nullable().optional(),
  baud: z.number().nullable().optional(),
  present: z.boolean().nullable().optional(),
  ready: z.boolean().nullable().optional(),
  transport: z
    .object({
      connected: z.boolean().nullable().optional(),
      protocolVerified: z.boolean().nullable().optional(),
      physicallyVerified: z.boolean().nullable().optional(),
    })
    .nullable()
    .optional(),
});
export type PassportInfo = z.infer<typeof passportInfoSchema>;

let readerOperation: Promise<void> = Promise.resolve();

function serializeReaderOperation<T>(operation: () => Promise<T>): Promise<T> {
  const pending = readerOperation.then(operation);
  readerOperation = pending.then(
    () => undefined,
    () => undefined,
  );
  return pending;
}

async function readPassportOperation(
  signal?: AbortSignal,
): Promise<PassportMrz> {
  const result = await requestHardware(
    '/api/passport/read',
    {
      method: 'GET',
      signal,
      schema: passportReadSchema,
    },
    20_000,
  );
  if (
    !result.mrz.ok ||
    !('allChecksOk' in result.mrz) ||
    !result.mrz.allChecksOk
  )
    throw new HardwareError('invalid_mrz');
  return result.mrz;
}

export function readPassport(signal?: AbortSignal): Promise<PassportMrz> {
  return serializeReaderOperation(() => readPassportOperation(signal));
}

export function stopPassport(signal?: AbortSignal): Promise<void> {
  return serializeReaderOperation(async () => {
    await requestHardware('/api/passport/stop', {
      method: 'GET',
      signal,
      schema: z.object({ ok: z.literal(true) }),
    });
  });
}

export function fetchPassportInfo(signal?: AbortSignal): Promise<PassportInfo> {
  return requestHardware('/api/passport/info', {
    method: 'GET',
    signal,
    schema: passportInfoSchema,
  });
}

export function useReadPassport() {
  return useMutation({
    mutationKey: hardwareKeys.passportRead(),
    mutationFn: ({ signal }: { signal?: AbortSignal }) => readPassport(signal),
    retry: false,
    gcTime: 0,
    meta: { sessionOwned: true },
  });
}
