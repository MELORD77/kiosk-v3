import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useKioskSessionStore, useSessionIdle } from '@/features/kiosk-session';
import { OperatorCallDialog } from '@/features/operator-call';
import { useKioskOrientation } from '@/shared/lib/kiosk';
import { BackNavigationProvider } from '@/shared/lib/back-navigation';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { isSkeletonPreview } from '@/shared/lib/skeleton-preview';
import { Fade } from '@/shared/ui/fade';
import { clearSessionCache } from '../providers/query-client';
import ornamentUrl from '../assets/kiosk-ornament.svg?url';
import { KioskHeader } from './kiosk-header';
import { KioskFooter } from './kiosk-footer';
import { KioskFooterSkeleton } from './kiosk-footer-skeleton';
import { DeveloperControls } from './developer-controls';
import { SessionWarning } from './session-warning';
import { KioskBackdrop } from './kiosk-backdrop';
import '../styles/kiosk-backdrop.css';

export function KioskLayout() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const client = useQueryClient();
  const orientation = useKioskOrientation();
  const isActive = useKioskSessionStore((state) => state.isActive);
  const sessionId = useKioskSessionStore((state) => state.sessionId);
  const sessionSignal = useKioskSessionStore((state) => state.signal);
  const [callSessionId, setCallSessionId] = useState<number | null>(null);
  const callOpener = useRef<{
    element: HTMLButtonElement;
    sessionId: number;
  } | null>(null);
  useEffect(() => {
    if (callSessionId !== null) return;
    const opener = callOpener.current;
    callOpener.current = null;
    if (
      isActive &&
      opener?.sessionId === sessionId &&
      opener.element.isConnected
    ) {
      opener.element.focus();
    }
  }, [callSessionId, isActive, sessionId]);
  const endSession = useKioskSessionStore((state) => state.endSession);
  const handleEndSession = useCallback(() => {
    clearSessionCache(client);
    endSession();
    void navigate('/', { replace: true });
  }, [client, endSession, navigate]);
  const idle = useSessionIdle({ onTimeout: handleEndSession });
  const goHome = useCallback(() => {
    void navigate('/home');
  }, [navigate]);

  return (
    <BackNavigationProvider
      enabled={pathname.startsWith('/services/')}
      fallback={goHome}
    >
      <div
        className="kiosk-shell h-[100dvh] flex flex-col"
        data-orientation={orientation}
      >
        <KioskHeader />
        <div className="kiosk-stage flex-1 min-h-0 flex flex-col">
          <div
            className="kiosk-ornament"
            aria-hidden="true"
            style={{ maskImage: `url("${ornamentUrl}")` }}
          />
          {pathname !== '/' && <KioskBackdrop />}
          <ScrollArea
            as="main"
            className="kiosk-main flex-1 min-h-0 overflow-auto flex flex-col [&_.page-container]:py-kiosk-8 [&_.page-container]:px-kiosk-page-gutter [&_.page-heading]:text-kiosk-page-heading [&_.page-subtitle]:text-kiosk-description"
          >
            <Fade
              key={pathname}
              kind="page"
              className="kiosk-route flex-1 min-h-0 flex flex-col"
            >
              <Outlet />
            </Fade>
          </ScrollArea>
        </div>
        {isActive &&
          (isSkeletonPreview(search) ? (
            <KioskFooterSkeleton />
          ) : (
            <KioskFooter
              onEndSession={handleEndSession}
              onCallOperator={(element) => {
                callOpener.current = { element, sessionId };
                setCallSessionId(sessionId);
              }}
            />
          ))}
        {import.meta.env.DEV && <DeveloperControls />}
        {isActive && callSessionId === sessionId && (
          <OperatorCallDialog
            key={sessionId}
            open
            sessionSignal={sessionSignal}
            onClose={() => setCallSessionId(null)}
          />
        )}
        <SessionWarning
          open={idle.isWarning}
          secondsLeft={idle.secondsLeft}
          onContinue={idle.continueSession}
          onEndSession={handleEndSession}
        />
      </div>
    </BackNavigationProvider>
  );
}
