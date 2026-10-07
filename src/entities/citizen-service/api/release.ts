import { z } from 'zod';

import { requestCitizenService } from './citizen-request';
import type {
  CitizenServiceRequest,
  CitizenServiceLanguage,
} from './citizen-request';

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
export function fetchRelease(
  input: CitizenServiceRequest,
  language: CitizenServiceLanguage,
  signal?: AbortSignal,
) {
  return requestCitizenService(
    'release',
    input,
    language,
    releaseSchema,
    signal,
  );
}
