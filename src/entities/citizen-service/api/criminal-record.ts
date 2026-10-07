import { z } from 'zod';

import { requestCitizenService } from './citizen-request';
import type {
  CitizenServiceRequest,
  CitizenServiceLanguage,
} from './citizen-request';

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
export function fetchCriminalRecord(
  input: CitizenServiceRequest,
  language: CitizenServiceLanguage,
  signal?: AbortSignal,
) {
  return requestCitizenService(
    'criminal-record',
    input,
    language,
    criminalRecordSchema,
    signal,
  );
}
