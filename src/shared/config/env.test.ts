import { describe, expect, it } from 'vitest';

import { parseEnv } from './env';

describe('kiosk configuration', () => {
  it('uses safe defaults and ignores unrelated environment values', () => {
    expect(parseEnv({ UNRELATED: 'value' })).toEqual({
      apiBaseUrl: undefined,
      routerMode: 'browser',
      kioskOrientation: 'auto',
      idleTimeoutMs: 120_000,
      idleWarningMs: 15_000,
    });
  });

  it('parses an explicit orientation and numeric timer values', () => {
    expect(
      parseEnv({
        VITE_API_BASE_URL: 'https://example.test/api/',
        VITE_KIOSK_ORIENTATION: 'landscape',
        VITE_IDLE_TIMEOUT_MS: '60000',
        VITE_IDLE_WARNING_MS: '5000',
      }),
    ).toEqual({
      apiBaseUrl: 'https://example.test/api/',
      routerMode: 'browser',
      kioskOrientation: 'landscape',
      idleTimeoutMs: 60_000,
      idleWarningMs: 5_000,
    });
  });

  it.each(['browser', 'hash'])('accepts %s routing', (routerMode) => {
    expect(parseEnv({ VITE_ROUTER_MODE: routerMode }).routerMode).toBe(
      routerMode,
    );
  });

  it.each(['', 'history', 'HASH'])(
    'rejects invalid routing mode %j',
    (mode) => {
      expect(() => parseEnv({ VITE_ROUTER_MODE: mode })).toThrow(
        'Invalid kiosk configuration: VITE_ROUTER_MODE.',
      );
    },
  );

  it('rejects unsafe configuration without including its value', () => {
    expect(() =>
      parseEnv({ VITE_API_BASE_URL: 'file:///private-value' }),
    ).toThrow('Invalid kiosk configuration: VITE_API_BASE_URL.');
    expect(() => parseEnv({ VITE_KIOSK_ORIENTATION: 'diagonal' })).toThrow(
      'VITE_KIOSK_ORIENTATION',
    );
    expect(() => parseEnv({ VITE_IDLE_TIMEOUT_MS: '0' })).toThrow(
      'VITE_IDLE_TIMEOUT_MS',
    );
    expect(() => parseEnv({ VITE_IDLE_WARNING_MS: '120000' })).toThrow(
      'VITE_IDLE_WARNING_MS',
    );
  });
});
