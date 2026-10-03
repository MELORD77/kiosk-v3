import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useKioskSessionStore } from './session-store';
import { useSessionIdle } from './use-session-idle';

beforeEach(() => {
  vi.useFakeTimers();
  useKioskSessionStore.getState().endSession();
  useKioskSessionStore.getState().startSession();
});

describe('session inactivity', () => {
  it('warns then expires, and cleans timers on unmount', () => {
    const onTimeout = vi.fn();
    const { result, unmount } = renderHook(() =>
      useSessionIdle({ onTimeout, timeoutMs: 1000, warningMs: 1000 }),
    );
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.isWarning).toBe(true);
    act(() => vi.advanceTimersByTime(1000));
    expect(onTimeout).toHaveBeenCalledOnce();
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('continues the same session without aborting work or losing form data', () => {
    const onTimeout = vi.fn();
    const session = useKioskSessionStore.getState();
    const { result } = renderHook(() =>
      useSessionIdle({ onTimeout, timeoutMs: 1000, warningMs: 1000 }),
    );
    act(() => vi.advanceTimersByTime(1000));
    act(() => result.current.continueSession());
    expect(result.current.isWarning).toBe(false);
    expect(useKioskSessionStore.getState().sessionId).toBe(session.sessionId);
    expect(session.signal.aborted).toBe(false);
    act(() => vi.advanceTimersByTime(500));
    expect(onTimeout).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(500));
    expect(result.current.isWarning).toBe(true);
  });

  it('does not carry a previous warning into a new session', () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() =>
      useSessionIdle({ onTimeout, timeoutMs: 1000, warningMs: 1000 }),
    );
    act(() => vi.advanceTimersByTime(1000));
    act(() => {
      useKioskSessionStore.getState().endSession();
      useKioskSessionStore.getState().startSession();
    });
    expect(result.current.isWarning).toBe(false);
    act(() => vi.advanceTimersByTime(500));
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it('resets the idle period after keyboard or touch activity', () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() =>
      useSessionIdle({ onTimeout, timeoutMs: 1000, warningMs: 1000 }),
    );
    act(() => {
      vi.advanceTimersByTime(500);
      window.dispatchEvent(new Event('pointerdown'));
      vi.advanceTimersByTime(500);
    });
    expect(result.current.isWarning).toBe(false);
    act(() => vi.advanceTimersByTime(500));
    expect(result.current.isWarning).toBe(true);
  });
});
