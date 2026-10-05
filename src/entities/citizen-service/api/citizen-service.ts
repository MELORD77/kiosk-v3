import { skipToken, useQuery } from '@tanstack/react-query';

import { ApiError } from '@/shared/api';

import { citizenServiceKeys } from './citizen-request';
import type { CitizenServiceParams } from './citizen-request';
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

export async function fetchCitizenService(
  number: number,
  params: CitizenServiceParams,
  signal?: AbortSignal,
): Promise<CitizenServiceResult> {
  switch (number) {
    case 7:
      return { number, result: await fetchResidence(params, signal) };
    case 8:
      return { number, result: await fetchResidents(params, signal) };
    case 12:
      return { number, result: await fetchCriminalRecord(params, signal) };
    case 22:
      return { number, result: await fetchRelease(params, signal) };
    default:
      throw new ApiError('http', 404);
  }
}

export function useCitizenService(
  number: number,
  params: CitizenServiceParams | null,
) {
  return useQuery({
    queryKey: citizenServiceKeys.serviceResult(number, params),
    queryFn: params
      ? ({ signal }) => fetchCitizenService(number, params, signal)
      : skipToken,
    meta: { sessionOwned: true },
    retry: false,
  });
}
