import { z } from 'zod';

export function catalogEnvelope<T extends z.ZodType>(result: T) {
  return z.object({
    message: z.string(),
    result,
    meta: z.unknown().nullable(),
    time: z.string(),
  });
}
