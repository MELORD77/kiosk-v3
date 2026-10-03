import { z } from 'zod';

interface IdentityMessages {
  pin: string;
  series: string;
  number: string;
}

export function createIdentitySchema(messages: IdentityMessages) {
  return z
    .object({
      method: z.enum(['pin', 'passport']),
      pin: z.string(),
      passportSeries: z.string(),
      passportNumber: z.string(),
    })
    .superRefine((input, context) => {
      if (input.method === 'pin') {
        if (!/^\d{14}$/.test(input.pin)) {
          context.addIssue({
            code: 'custom',
            path: ['pin'],
            message: messages.pin,
          });
        }
        return;
      }
      if (!/^[A-Z]{2}$/.test(input.passportSeries)) {
        context.addIssue({
          code: 'custom',
          path: ['passportSeries'],
          message: messages.series,
        });
      }
      if (!/^\d{7}$/.test(input.passportNumber)) {
        context.addIssue({
          code: 'custom',
          path: ['passportNumber'],
          message: messages.number,
        });
      }
    });
}

export type IdentityInput = z.infer<ReturnType<typeof createIdentitySchema>>;
export type IdentityField = 'pin' | 'passportSeries' | 'passportNumber';

export function emptyIdentityInput(
  method: IdentityInput['method'] = 'pin',
): IdentityInput {
  return { method, pin: '', passportSeries: '', passportNumber: '' };
}

export function normalizeIdentityField(
  field: IdentityField,
  value: string,
): string {
  if (field === 'passportSeries')
    return value
      .replace(/[^a-z]/gi, '')
      .toUpperCase()
      .slice(0, 2);
  const maxLength = field === 'pin' ? 14 : 7;
  return value.replace(/\D/g, '').slice(0, maxLength);
}
