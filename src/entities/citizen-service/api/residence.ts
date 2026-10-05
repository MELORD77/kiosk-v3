import { skipToken, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { citizenServiceKeys, requestCitizenService } from './citizen-request';
import type { CitizenServiceParams } from './citizen-request';

const registrationSchema = z.object({
  cadaster: z.string().nullable(),
  region: z.string().nullable(),
  district: z.string().nullable(),
  address: z.string().nullable(),
  registrationDate: z.string().nullable(),
});

export const residenceSchema = z.object({
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  middleName: z.string().nullable(),
  birthday: z.string().nullable(),
  gender: z.string().nullable(),
  birthPlace: z.string().nullable(),
  permanentRegistration: registrationSchema,
  temporaryRegistrations: z.array(
    registrationSchema.extend({ validDate: z.string().nullable() }),
  ),
  document: z
    .object({
      serialNumber: z.string().nullable(),
      issuedBy: z.string().nullable(),
      dateIssue: z.string().nullable(),
      dateValid: z.string().nullable(),
    })
    .nullable(),
  pdfLink: z.string(),
});
export type Residence = z.infer<typeof residenceSchema>;
export const residenceKeys = {
  result: (params: CitizenServiceParams | null) =>
    citizenServiceKeys.result(7, params),
};
export function fetchResidence(
  params: CitizenServiceParams,
  signal?: AbortSignal,
) {
  return requestCitizenService('residence', params, residenceSchema, signal);
}
export function useResidence(params: CitizenServiceParams | null) {
  return useQuery({
    queryKey: residenceKeys.result(params),
    queryFn: params
      ? ({ signal }) => fetchResidence(params, signal)
      : skipToken,
    meta: { sessionOwned: true },
    retry: false,
  });
}
