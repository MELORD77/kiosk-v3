import { skipToken, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { citizenServiceKeys, requestCitizenService } from './citizen-request';
import type { CitizenServiceParams } from './citizen-request';

const residentSchema = z.object({
  fullName: z.string().nullable(),
  status: z.string().nullable(),
  registrationDate: z.string().nullable(),
});
export const residentsSchema = z.object({
  cadaster: z.string(),
  address: z.string().nullable(),
  permanent: z.array(residentSchema),
  temporary: z.array(
    residentSchema.extend({ validDate: z.string().nullable() }),
  ),
});
export type Residents = z.infer<typeof residentsSchema>;
export const residentsKeys = {
  result: (params: CitizenServiceParams | null) =>
    citizenServiceKeys.result(8, params),
};
export function fetchResidents(
  params: CitizenServiceParams,
  signal?: AbortSignal,
) {
  return requestCitizenService('residents', params, residentsSchema, signal);
}
export function useResidents(params: CitizenServiceParams | null) {
  return useQuery({
    queryKey: residentsKeys.result(params),
    queryFn: params
      ? ({ signal }) => fetchResidents(params, signal)
      : skipToken,
    meta: { sessionOwned: true },
    retry: false,
  });
}
