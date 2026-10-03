import { beforeEach, describe, expect, it } from 'vitest';
import { useKioskSessionStore } from './session-store';

beforeEach(() => useKioskSessionStore.getState().endSession());

describe('kiosk session', () => {
  it('aborts prior work and rotates session identity on start and end', () => {
    const previous = useKioskSessionStore.getState();
    previous.startSession();
    const active = useKioskSessionStore.getState();
    expect(previous.signal.aborted).toBe(true);
    expect(active.isActive).toBe(true);
    expect(active.sessionId).toBe(previous.sessionId + 1);
    expect(active.signal.aborted).toBe(false);
    active.endSession();
    expect(active.signal.aborted).toBe(true);
    expect(useKioskSessionStore.getState().isActive).toBe(false);
  });
});
