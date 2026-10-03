import { z } from 'zod';

export interface DemoLabelMessages {
  required: string;
  minLength: string;
  maxLength: string;
}

export function createDemoLabelSchema(messages: DemoLabelMessages) {
  return z.object({
    label: z
      .string({ error: messages.required })
      .trim()
      .min(1, messages.required)
      .min(3, messages.minLength)
      .max(40, messages.maxLength),
  });
}

export type DemoLabelInput = z.infer<ReturnType<typeof createDemoLabelSchema>>;
