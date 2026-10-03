import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { apiClient } from '@/shared/api';

import { serviceSchema } from '../model/service-catalog';
import type { ServiceSummary } from '../model/service-catalog';
import { catalogEnvelope } from './catalog-envelope';

export const servicesResponseSchema = catalogEnvelope(z.array(serviceSchema));
export type ServicesResponse = z.infer<typeof servicesResponseSchema>;

function normalizedCategory(category?: string): string | undefined {
  return category?.trim() || undefined;
}

export const serviceKeys = {
  all: ['service-catalog', 'services'] as const,
  lists: () => [...serviceKeys.all, 'list'] as const,
  list: (category?: string) =>
    [...serviceKeys.lists(), normalizedCategory(category) ?? null] as const,
  details: () => [...serviceKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceKeys.details(), id] as const,
};

export async function fetchServices(
  category?: string,
  signal?: AbortSignal,
): Promise<ServiceSummary[]> {
  const filter = normalizedCategory(category);
  const path = filter
    ? `/api/v3/services?${new URLSearchParams({ category: filter })}`
    : '/api/v3/services';
  const { result } = await apiClient.request(path, {
    method: 'GET',
    signal,
    schema: servicesResponseSchema,
  });
  return result;
}

export function useServices(category?: string) {
  return useQuery({
    queryKey: serviceKeys.list(category),
    queryFn: ({ signal }) => fetchServices(category, signal),
  });
}
