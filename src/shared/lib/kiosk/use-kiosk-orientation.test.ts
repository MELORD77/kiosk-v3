import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useOrientationStore } from './orientation-store';
import { useKioskOrientation } from './use-kiosk-orientation';

describe('kiosk orientation', () => {
  it('responds to physical rotation and allows a fixed layout preference', () => {
    let portrait = false;
    const listeners = new Set<() => void>();
    vi.stubGlobal('matchMedia', (query: string) => ({
      get matches() {
        return portrait;
      },
      media: query,
      addEventListener: (_event: string, callback: () => void) =>
        listeners.add(callback),
      removeEventListener: (_event: string, callback: () => void) =>
        listeners.delete(callback),
    }));
    useOrientationStore.getState().setPreference('auto');
    const { result, unmount } = renderHook(useKioskOrientation);
    expect(result.current).toBe('landscape');
    act(() => {
      portrait = true;
      listeners.forEach((callback) => callback());
    });
    expect(result.current).toBe('portrait');
    act(() => useOrientationStore.getState().setPreference('landscape'));
    expect(result.current).toBe('landscape');
    unmount();
    expect(listeners.size).toBe(0);
    useOrientationStore.getState().setPreference('auto');
  });
});
