import { z } from 'zod';

interface IdentityMessages {
  pin: string;
  series: string;
  number: string;
  birthDate: string;
}

export function createIdentitySchema(messages: IdentityMessages) {
  return z
    .object({
      method: z.enum(['pin', 'passport']),
      pin: z.string(),
      passportSeries: z.string(),
      passportNumber: z.string(),
      birthDate: z.string(),
    })
    .superRefine((input, context) => {
      if (input.method === 'pin') {
        if (!isValidIdentityField('pin', input.pin)) {
          context.addIssue({
            code: 'custom',
            path: ['pin'],
            message: messages.pin,
          });
        }
        return;
      }
      if (!isValidIdentityField('passportSeries', input.passportSeries)) {
        context.addIssue({
          code: 'custom',
          path: ['passportSeries'],
          message: messages.series,
        });
      }
      if (!isValidIdentityField('passportNumber', input.passportNumber)) {
        context.addIssue({
          code: 'custom',
          path: ['passportNumber'],
          message: messages.number,
        });
      }
      if (!isValidIdentityField('birthDate', input.birthDate)) {
        context.addIssue({
          code: 'custom',
          path: ['birthDate'],
          message: messages.birthDate,
        });
      }
    });
}

export type IdentityInput = z.infer<ReturnType<typeof createIdentitySchema>>;
export type IdentityField =
  'pin' | 'passportSeries' | 'passportNumber' | 'birthDate';

export function isValidIdentityField(
  field: IdentityField,
  value: string,
): boolean {
  switch (field) {
    case 'pin':
      return /^\d{14}$/.test(value);
    case 'passportSeries':
      return /^[A-Z]{2}$/.test(value);
    case 'passportNumber':
      return /^\d{7}$/.test(value);
    case 'birthDate':
      return isValidBirthDate(value);
  }
}

export function emptyIdentityInput(
  method: IdentityInput['method'] = 'pin',
): IdentityInput {
  return {
    method,
    pin: '',
    passportSeries: '',
    passportNumber: '',
    birthDate: '',
  };
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
  if (field === 'birthDate') {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)]
      .filter(Boolean)
      .join('.');
  }
  const maxLength = field === 'pin' ? 14 : 7;
  return value.replace(/\D/g, '').slice(0, maxLength);
}

function isValidBirthDate(value: string): boolean {
  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(value)) return false;
  const [day, month, year] = value.split('.').map(Number);
  if (!day || !month || !year) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    return false;
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tashkent',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  return (
    `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` <=
    today
  );
}
