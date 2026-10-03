import { describe, expect, it } from 'vitest';
import {
  createIdentitySchema,
  emptyIdentityInput,
  normalizeIdentityField,
} from './identity-schema';

const schema = createIdentitySchema({
  pin: 'pin',
  series: 'series',
  number: 'number',
});

describe('identity input', () => {
  it('accepts exactly fourteen digits for the PIN method', () => {
    expect(
      schema.safeParse({ ...emptyIdentityInput(), pin: '12345678901234' })
        .success,
    ).toBe(true);
    for (const pin of [
      '',
      '1234567890123',
      '123456789012345',
      '1234567890123a',
    ]) {
      expect(schema.safeParse({ ...emptyIdentityInput(), pin }).success).toBe(
        false,
      );
    }
  });

  it('requires both uppercase ASCII series and a seven digit passport number', () => {
    const passport = {
      ...emptyIdentityInput('passport'),
      passportSeries: 'AB',
      passportNumber: '0123456',
    };
    expect(schema.safeParse(passport).success).toBe(true);
    for (const passportSeries of ['A', 'ABC', 'ab', 'АБ', 'A1']) {
      expect(schema.safeParse({ ...passport, passportSeries }).success).toBe(
        false,
      );
    }
    for (const passportNumber of ['', '123456', '12345678', '123456a']) {
      expect(schema.safeParse({ ...passport, passportNumber }).success).toBe(
        false,
      );
    }
  });

  it('normalizes typed and pasted values without dropping leading zeroes', () => {
    expect(normalizeIdentityField('passportSeries', 'a b123')).toBe('AB');
    expect(normalizeIdentityField('passportNumber', '01 234-56')).toBe(
      '0123456',
    );
    expect(normalizeIdentityField('pin', '01234567890123456')).toBe(
      '01234567890123',
    );
  });

  it('clears all fields when creating input for another method', () => {
    expect(emptyIdentityInput('passport')).toEqual({
      method: 'passport',
      pin: '',
      passportSeries: '',
      passportNumber: '',
    });
  });
});
