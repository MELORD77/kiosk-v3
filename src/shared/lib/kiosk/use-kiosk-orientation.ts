import { useSyncExternalStore } from 'react';
import { useOrientationStore } from './orientation-store';
import type { KioskOrientation } from './orientation-store';

const mediaQuery = '(orientation: portrait)';

function subscribe(onChange: () => void) {
  const media = window.matchMedia(mediaQuery);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function getSnapshot(): KioskOrientation {
  return window.matchMedia(mediaQuery).matches ? 'portrait' : 'landscape';
}

export function useKioskOrientation(): KioskOrientation {
  const preference = useOrientationStore((state) => state.preference);
  const detected = useSyncExternalStore<KioskOrientation>(
    subscribe,
    getSnapshot,
    () => 'landscape',
  );
  return preference === 'auto' ? detected : preference;
}
