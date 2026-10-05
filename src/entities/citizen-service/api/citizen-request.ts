import { z } from 'zod';

import { ApiError, apiClient } from '@/shared/api';

export const citizenServiceParamsSchema = z.object({
  uid: z.string().regex(/^[a-f\d]{64}$/i),
  language: z.enum(['uz', 'cr', 'ru', 'en']),
});
export type CitizenServiceParams = z.infer<typeof citizenServiceParamsSchema>;

export const citizenServiceKeys = {
  all: ['session', 'citizen-service'] as const,
  result: (number: number, params: CitizenServiceParams | null) =>
    [
      ...citizenServiceKeys.all,
      number,
      params?.uid ?? null,
      params?.language ?? null,
    ] as const,
  serviceResult: (number: number, params: CitizenServiceParams | null) =>
    [...citizenServiceKeys.result(number, params), 'service-result'] as const,
};

export function citizenEnvelope<T extends z.ZodType>(result: T) {
  return z.object({
    message: z.string(),
    result,
    meta: z.unknown().nullable(),
    time: z.string(),
  });
}

export async function requestCitizenService<T>(
  route: string,
  params: CitizenServiceParams,
  schema: z.ZodType<T>,
  signal?: AbortSignal,
): Promise<T> {
  if (!citizenServiceParamsSchema.safeParse(params).success)
    throw new ApiError('validation');
  const { result } = await apiClient.request(`/api/v3/citizen/${route}`, {
    method: 'GET',
    headers: { 'x-user-uuid': params.uid, 'x-app-lang': params.language },
    signal,
    schema: citizenEnvelope(schema),
  });
  return result;
}
