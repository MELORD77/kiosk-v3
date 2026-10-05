import { z } from 'zod';

import { ApiError, apiClient } from '@/shared/api';

import { citizenEnvelope } from './citizen-request';

function isValidBirthDate(value: string): boolean {
  const [day, month, year] = value.split('.').map(Number);
  if (day === undefined || month === undefined || year === undefined)
    return false;
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export const identifyRequestSchema = z.union([
  z.strictObject({ pinfl: z.string().regex(/^\d{14}$/) }),
  z.strictObject({
    passportSerial: z.string().regex(/^[A-Z]{2}\d{7}$/),
    birthDate: z
      .string()
      .regex(/^\d{2}\.\d{2}\.\d{4}$/)
      .refine(isValidBirthDate),
  }),
]);
export type IdentifyRequest = z.infer<typeof identifyRequestSchema>;

export async function identifyCitizen(
  input: IdentifyRequest,
  signal?: AbortSignal,
): Promise<unknown> {
  const parsed = identifyRequestSchema.safeParse(input);
  if (!parsed.success) throw new ApiError('validation');
  const { result } = await apiClient.request('/api/v3/citizen/identify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
    signal,
    schema: citizenEnvelope(z.unknown()),
  });
  return result;
}
