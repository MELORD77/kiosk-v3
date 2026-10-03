import { describe, expect, it } from 'vitest';

import { createDemoLabelSchema } from './demo-label-schema';

const schema = createDemoLabelSchema({
  required: 'Required',
  minLength: 'Too short',
  maxLength: 'Too long',
});

describe('development demo label validation', () => {
  it('trims valid labels', () => {
    expect(schema.parse({ label: '  Kiosk  ' })).toEqual({ label: 'Kiosk' });
  });

  it.each(['', '  ', 'ab', 'a'.repeat(41)])(
    'rejects invalid labels: %s',
    (label) => {
      expect(schema.safeParse({ label }).success).toBe(false);
    },
  );

  it('accepts the length boundaries', () => {
    expect(schema.safeParse({ label: 'abc' }).success).toBe(true);
    expect(schema.safeParse({ label: 'a'.repeat(40) }).success).toBe(true);
  });
});
