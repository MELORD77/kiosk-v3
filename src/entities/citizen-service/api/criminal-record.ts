import { skipToken, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { citizenServiceKeys, requestCitizenService } from './citizen-request';
import type { CitizenServiceParams } from './citizen-request';

const nullableString = z.string().nullable();
export const criminalRecordSchema = z.object({
  isConvicted: z.boolean(),
  records: z.array(
    z.object({
      crimeCaseNum: nullableString,
      convictedDate: nullableString,
      court: z.object({
        country: nullableString,
        region: nullableString,
        area: nullableString,
        organAddress: nullableString,
      }),
      articles: z.array(z.unknown()),
      term: z.object({
        years: nullableString,
        months: nullableString,
        days: nullableString,
        hours: nullableString,
      }),
      additionalMeasures: z.array(z.unknown()),
      arrestDate: nullableString,
      freedDate: nullableString,
      freedBy: nullableString,
      note: nullableString,
      additionalInfo: z.record(z.string(), z.unknown()).nullable(),
    }),
  ),
});
export type CriminalRecord = z.infer<typeof criminalRecordSchema>;
export const criminalRecordKeys = {
  result: (params: CitizenServiceParams | null) =>
    citizenServiceKeys.result(12, params),
};
export function fetchCriminalRecord(
  params: CitizenServiceParams,
  signal?: AbortSignal,
) {
  return requestCitizenService(
    'criminal-record',
    params,
    criminalRecordSchema,
    signal,
  );
}
export function useCriminalRecord(params: CitizenServiceParams | null) {
  return useQuery({
    queryKey: criminalRecordKeys.result(params),
    queryFn: params
      ? ({ signal }) => fetchCriminalRecord(params, signal)
      : skipToken,
    meta: { sessionOwned: true },
    retry: false,
  });
}
