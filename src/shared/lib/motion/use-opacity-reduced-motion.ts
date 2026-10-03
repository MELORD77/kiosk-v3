import { useSyncExternalStore } from 'react';

const preferenceQuery = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const preference = window.matchMedia(preferenceQuery);
  preference.addEventListener('change', onChange);
  return () => preference.removeEventListener('change', onChange);
}

function getSnapshot() {
  return window.matchMedia(preferenceQuery).matches;
}

function getServerSnapshot() {
  return true;
}

export function useOpacityReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
