import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { apiClient } from '@/shared/api';

import { serviceCategorySchema } from '../model/service-catalog';
import type { ServiceCategory } from '../model/service-catalog';
import { catalogEnvelope } from './catalog-envelope';

export const categoriesResponseSchema = catalogEnvelope(
  z.array(serviceCategorySchema),
);
export type CategoriesResponse = z.infer<typeof categoriesResponseSchema>;

export const serviceCategoryKeys = {
  all: ['service-catalog', 'categories'] as const,
  list: () => [...serviceCategoryKeys.all, 'list'] as const,
};

export async function fetchServiceCategories(
  signal?: AbortSignal,
): Promise<ServiceCategory[]> {
  const { result } = await apiClient.request('/api/v3/services/categories', {
    method: 'GET',
    signal,
    schema: categoriesResponseSchema,
  });
  return result;
}

export function useServiceCategories() {
  return useQuery({
    queryKey: serviceCategoryKeys.list(),
    queryFn: ({ signal }) => fetchServiceCategories(signal),
  });
}
