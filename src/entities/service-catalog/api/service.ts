import { useQuery } from '@tanstack/react-query';
import type { z } from 'zod';

import { ApiError, apiClient } from '@/shared/api';

import { serviceIdSchema, serviceSchema } from '../model/service-catalog';
import type { ServiceSummary } from '../model/service-catalog';
import { catalogEnvelope } from './catalog-envelope';
import { serviceKeys } from './services';

export const serviceResponseSchema = catalogEnvelope(serviceSchema);
export type ServiceResponse = z.infer<typeof serviceResponseSchema>;

export async function fetchService(
  id: string,
  signal?: AbortSignal,
): Promise<ServiceSummary> {
  if (!serviceIdSchema.safeParse(id).success) throw new ApiError('http', 404);

  const { result } = await apiClient.request(`/api/v3/services/${id}`, {
    method: 'GET',
    signal,
    schema: serviceResponseSchema,
  });
  return result;
}

export function useService(id: string) {
  return useQuery({
    queryKey: serviceKeys.detail(id),
    queryFn: ({ signal }) => fetchService(id, signal),
  });
}
