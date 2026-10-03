import { useEffect, useRef, useState } from 'react';
import { env } from '@/shared/config';
import { useKioskSessionStore } from './session-store';

interface IdleOptions {
  onTimeout: () => void;
  timeoutMs?: number;
  warningMs?: number;
}

export function useSessionIdle({
  onTimeout,
  timeoutMs = env.idleTimeoutMs,
  warningMs = env.idleWarningMs,
}: IdleOptions) {
  const isActive = useKioskSessionStore((state) => state.isActive);
  const sessionId = useKioskSessionStore((state) => state.sessionId);
  const [warning, setWarning] = useState<{
    sessionId: number;
    deadline: number;
  } | null>(null);
  const [activityCycle, setActivityCycle] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const lastActivity = useRef(0);

  useEffect(() => {
    if (!isActive) return;
    lastActivity.current = Date.now();
    const recordActivity = () => {
      lastActivity.current = Date.now();
    };
    const events = ['pointerdown', 'keydown', 'wheel'] as const;
    events.forEach((event) =>
      window.addEventListener(event, recordActivity, { passive: true }),
    );
    const interval = window.setInterval(() => {
      if (Date.now() - lastActivity.current >= timeoutMs) {
        const expiresAt = Date.now() + warningMs;
        setWarning({ sessionId, deadline: expiresAt });
        setSecondsLeft(Math.ceil(warningMs / 1000));
        window.clearInterval(interval);
      }
    }, 500);
    return () => {
      window.clearInterval(interval);
      events.forEach((event) =>
        window.removeEventListener(event, recordActivity),
      );
    };
  }, [isActive, sessionId, timeoutMs, warningMs, activityCycle]);

  const deadline = warning?.sessionId === sessionId ? warning.deadline : null;
  useEffect(() => {
    if (deadline === null || !isActive) return;
    const interval = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        window.clearInterval(interval);
        onTimeout();
      }
    }, 250);
    return () => window.clearInterval(interval);
  }, [deadline, isActive, onTimeout]);

  return {
    isWarning: isActive && deadline !== null,
    secondsLeft,
    continueSession: () => {
      setWarning(null);
      setActivityCycle((cycle) => cycle + 1);
    },
  };
}
