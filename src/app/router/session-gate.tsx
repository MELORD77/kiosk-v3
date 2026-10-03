import { Fragment, useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { useKioskSessionStore } from '@/features/kiosk-session';

export function SessionGate({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isActive = useKioskSessionStore((state) => state.isActive);
  const sessionId = useKioskSessionStore((state) => state.sessionId);
  useEffect(() => {
    if (!useKioskSessionStore.getState().isActive) {
      useKioskSessionStore.getState().startSession();
    }
  }, [pathname]);
  return isActive ? <Fragment key={sessionId}>{children}</Fragment> : null;
}
