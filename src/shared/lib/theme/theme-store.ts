import { create } from 'zustand';
import { readPreference, writePreference } from '@/shared/lib/storage';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
export const themeStorageKey = 'kiosk-theme';

function readTheme(): ThemePreference {
  const value = readPreference(themeStorageKey);
  return value === 'light' || value === 'dark' || value === 'system'
    ? value
    : 'light';
}

interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: readTheme(),
  setPreference: (preference) => {
    writePreference(themeStorageKey, preference);
    set({ preference });
  },
}));

export function resolveTheme(
  preference: ThemePreference,
  systemDark: boolean,
): ResolvedTheme {
  return preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;
}
