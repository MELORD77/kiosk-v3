import { z } from 'zod';

import { ApiError, apiClient } from '@/shared/api';

const maxRequestBytes = 10 * 1024 * 1024;
const photoPrefix = 'data:image/jpeg;base64,';

function isValidBirthDate(value: string): boolean {
  const [day, month, year] = value.split('.').map(Number);
  if (day === undefined || month === undefined || year === undefined)
    return false;
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const pinflDocumentSchema = z.strictObject({
  method: z.literal('PINFL'),
  pinfl: z.string().regex(/^\d{14}$/),
});
const passportDocumentSchema = z.strictObject({
  method: z.literal('PASSPORT'),
  passportSerial: z.string().regex(/^[A-Za-z]{2}\d{7}$/),
  birthDate: z
    .string()
    .regex(/^\d{2}\.\d{2}\.\d{4}$/)
    .refine(isValidBirthDate),
});
export const citizenDocumentInputSchema = z.discriminatedUnion('method', [
  pinflDocumentSchema,
  passportDocumentSchema,
]);
export type CitizenDocumentInput = z.infer<typeof citizenDocumentInputSchema>;
const photoSchema = z
  .string()
  .max(maxRequestBytes)
  .regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/)
  .refine((photo) => (photo.length - photoPrefix.length) % 4 === 0);
export const citizenServiceRequestSchema = z.discriminatedUnion('method', [
  pinflDocumentSchema.extend({ photo: photoSchema }),
  passportDocumentSchema.extend({ photo: photoSchema }),
]);
export type CitizenServiceRequest = z.infer<typeof citizenServiceRequestSchema>;
const citizenServiceLanguageSchema = z.enum(['uz', 'cr', 'ru', 'en', 'kk']);
export type CitizenServiceLanguage = z.infer<
  typeof citizenServiceLanguageSchema
>;

export const citizenServiceKeys = {
  all: ['session', 'citizen-service'] as const,
  request: () => [...citizenServiceKeys.all, 'request'] as const,
};

export function citizenEnvelope<T extends z.ZodType>(result: T) {
  return z.object({
    message: z.string(),
    result,
    meta: z.unknown().nullable(),
    time: z.string(),
  });
}

export const citizenErrorMessageSchema = z
  .object({
    message: z.union([
      z.string(),
      z.object({
        uz: z.string(),
        cr: z.string(),
        ru: z.string(),
        en: z.string(),
        kk: z.string().optional(),
      }),
    ]),
  })
  .transform(({ message }) => message);

export async function requestCitizenService<T>(
  route: string,
  input: CitizenServiceRequest,
  language: CitizenServiceLanguage,
  schema: z.ZodType<T>,
  signal?: AbortSignal,
): Promise<T> {
  const parsed = citizenServiceRequestSchema.safeParse(input);
  if (
    !parsed.success ||
    !citizenServiceLanguageSchema.safeParse(language).success
  )
    throw new ApiError('validation');
  const body = JSON.stringify(parsed.data);
  if (body.length > maxRequestBytes) throw new ApiError('validation');
  signal?.throwIfAborted();
  const { result } = await apiClient.request(`/api/v3/citizen/${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-app-lang': language },
    body,
    signal,
    schema: citizenEnvelope(schema),
    errorMessageSchema: citizenErrorMessageSchema,
  });
  return result;
}
