import { z } from 'zod';

import { requestCitizenService } from './citizen-request';
import type {
  CitizenServiceRequest,
  CitizenServiceLanguage,
} from './citizen-request';

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
export function fetchResidents(
  input: CitizenServiceRequest,
  language: CitizenServiceLanguage,
  signal?: AbortSignal,
) {
  return requestCitizenService(
    'residents',
    input,
    language,
    residentsSchema,
    signal,
  );
}
