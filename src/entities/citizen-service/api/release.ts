import { skipToken, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { citizenServiceKeys, requestCitizenService } from './citizen-request';
import type { CitizenServiceParams } from './citizen-request';

export const releaseSchema = z.object({
  isReleased: z.boolean(),
  records: z.array(
    z.object({
      crimeCaseNum: z.string().nullable(),
      convictedDate: z.string().nullable(),
      articles: z.array(z.unknown()),
      term: z.object({
        years: z.string().nullable(),
        months: z.string().nullable(),
        days: z.string().nullable(),
        hours: z.string().nullable(),
      }),
      freedDate: z.string(),
      freedBy: z.string().nullable(),
    }),
  ),
});
export type Release = z.infer<typeof releaseSchema>;
export const releaseKeys = {
  result: (params: CitizenServiceParams | null) =>
    citizenServiceKeys.result(22, params),
};
export function fetchRelease(
  params: CitizenServiceParams,
  signal?: AbortSignal,
) {
  return requestCitizenService('release', params, releaseSchema, signal);
}
export function useRelease(params: CitizenServiceParams | null) {
  return useQuery({
    queryKey: releaseKeys.result(params),
    queryFn: params ? ({ signal }) => fetchRelease(params, signal) : skipToken,
    meta: { sessionOwned: true },
    retry: false,
  });
}
