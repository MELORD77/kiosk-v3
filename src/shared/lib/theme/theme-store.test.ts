import { describe, expect, it, vi } from 'vitest';
import { resolveTheme, themeStorageKey, useThemeStore } from './theme-store';

describe('theme preference', () => {
  it('persists a preference independently of the resolved system theme', () => {
    useThemeStore.getState().setPreference('system');
    expect(localStorage.getItem(themeStorageKey)).toBe('system');
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('continues working when preference storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    expect(() => useThemeStore.getState().setPreference('dark')).not.toThrow();
    expect(useThemeStore.getState().preference).toBe('dark');
  });
});
