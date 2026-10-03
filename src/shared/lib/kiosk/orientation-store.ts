import { create } from 'zustand';
import { env, type KioskOrientationPreference } from '@/shared/config';
import { readPreference, writePreference } from '@/shared/lib/storage';

export type KioskOrientation = 'portrait' | 'landscape';
export const orientationStorageKey = 'kiosk-orientation';

function readOrientation(): KioskOrientationPreference {
  if (env.kioskOrientation !== 'auto') return env.kioskOrientation;
  const value = readPreference(orientationStorageKey);
  return value === 'portrait' || value === 'landscape' ? value : 'auto';
}

interface OrientationState {
  preference: KioskOrientationPreference;
  setPreference: (value: KioskOrientationPreference) => void;
}

export const useOrientationStore = create<OrientationState>((set) => ({
  preference: readOrientation(),
  setPreference: (preference) => {
    if (env.kioskOrientation !== 'auto') return;
    writePreference(orientationStorageKey, preference);
    set({ preference });
  },
}));
