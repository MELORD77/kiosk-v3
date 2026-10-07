import { useMutation } from '@tanstack/react-query';

import { ApiError } from '@/shared/api';

import { citizenServiceKeys } from './citizen-request';
import type {
  CitizenServiceRequest,
  CitizenServiceLanguage,
} from './citizen-request';
import { fetchCriminalRecord } from './criminal-record';
import type { CriminalRecord } from './criminal-record';
import { fetchRelease } from './release';
import type { Release } from './release';
import { fetchResidence } from './residence';
import type { Residence } from './residence';
import { fetchResidents } from './residents';
import type { Residents } from './residents';

export type CitizenServiceResult =
  | { number: 7; result: Residence }
  | { number: 8; result: Residents }
  | { number: 12; result: CriminalRecord }
  | { number: 22; result: Release };

export interface RequestCitizenServiceVariables {
  number: number;
  input: CitizenServiceRequest;
  language: CitizenServiceLanguage;
  signal?: AbortSignal;
}

export async function fetchCitizenService(
  number: number,
  input: CitizenServiceRequest,
  language: CitizenServiceLanguage,
  signal?: AbortSignal,
): Promise<CitizenServiceResult> {
  switch (number) {
    case 7:
      return { number, result: await fetchResidence(input, language, signal) };
    case 8:
      return { number, result: await fetchResidents(input, language, signal) };
    case 12:
      return {
        number,
        result: await fetchCriminalRecord(input, language, signal),
      };
    case 22:
      return { number, result: await fetchRelease(input, language, signal) };
    default:
      throw new ApiError('http', 404);
  }
}

export function useRequestCitizenService() {
  return useMutation({
    mutationKey: citizenServiceKeys.request(),
    mutationFn: ({
      number,
      input,
      language,
      signal,
    }: RequestCitizenServiceVariables) =>
      fetchCitizenService(number, input, language, signal),
    meta: { sessionOwned: true },
    gcTime: 0,
    retry: false,
  });
}
