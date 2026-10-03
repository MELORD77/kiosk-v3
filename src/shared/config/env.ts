import { z } from 'zod';

const orientationSchema = z.enum(['auto', 'portrait', 'landscape']);

const envSchema = z
  .object({
    VITE_API_BASE_URL: z.url({ protocol: /^https?$/ }).optional(),
    VITE_ROUTER_MODE: z.enum(['browser', 'hash']).default('browser'),
    VITE_KIOSK_ORIENTATION: orientationSchema.default('auto'),
    VITE_IDLE_TIMEOUT_MS: z.coerce.number().int().positive().default(120_000),
    VITE_IDLE_WARNING_MS: z.coerce.number().int().positive().default(15_000),
  })
  .refine((value) => value.VITE_IDLE_WARNING_MS < value.VITE_IDLE_TIMEOUT_MS, {
    path: ['VITE_IDLE_WARNING_MS'],
  });

export type KioskOrientationPreference = z.infer<typeof orientationSchema>;

export function parseEnv(source: Record<string, unknown>) {
  const result = envSchema.safeParse({
    VITE_API_BASE_URL:
      source.VITE_API_BASE_URL === '' ? undefined : source.VITE_API_BASE_URL,
    VITE_KIOSK_ORIENTATION: source.VITE_KIOSK_ORIENTATION,
    VITE_ROUTER_MODE: source.VITE_ROUTER_MODE,
    VITE_IDLE_TIMEOUT_MS: source.VITE_IDLE_TIMEOUT_MS,
    VITE_IDLE_WARNING_MS: source.VITE_IDLE_WARNING_MS,
  });

  if (!result.success) {
    const fields = [
      ...new Set(result.error.issues.map((issue) => issue.path.join('.'))),
    ];
    throw new Error(`Invalid kiosk configuration: ${fields.join(', ')}.`);
  }

  return Object.freeze({
    apiBaseUrl: result.data.VITE_API_BASE_URL,
    routerMode: result.data.VITE_ROUTER_MODE,
    kioskOrientation: result.data.VITE_KIOSK_ORIENTATION,
    idleTimeoutMs: result.data.VITE_IDLE_TIMEOUT_MS,
    idleWarningMs: result.data.VITE_IDLE_WARNING_MS,
  });
}

export const env = parseEnv(import.meta.env);
