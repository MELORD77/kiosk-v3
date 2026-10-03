import { styles } from './styles';
import { useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useKioskSessionStore, useSessionIdle } from '@/features/kiosk-session';
import { useKioskOrientation } from '@/shared/lib/kiosk';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { isSkeletonPreview } from '@/shared/lib/skeleton-preview';
import { Fade } from '@/shared/ui/fade';
import { clearSessionCache } from '../providers/query-client';
import { KioskHeader } from './kiosk-header';
import { KioskFooter } from './kiosk-footer';
import { KioskFooterSkeleton } from './kiosk-footer-skeleton';
import { DeveloperControls } from './developer-controls';
import { SessionWarning } from './session-warning';

export function KioskLayout() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const client = useQueryClient();
  const orientation = useKioskOrientation();
  const isActive = useKioskSessionStore((state) => state.isActive);
  const endSession = useKioskSessionStore((state) => state.endSession);
  const handleEndSession = useCallback(() => {
    clearSessionCache(client);
    endSession();
    void navigate('/', { replace: true });
  }, [client, endSession, navigate]);
  const idle = useSessionIdle({ onTimeout: handleEndSession });

  return (
    <div className={styles['kiosk-shell']} data-orientation={orientation}>
      <KioskHeader />
      <ScrollArea as="main" className={styles['kiosk-main']}>
        <Fade key={pathname} kind="page" className={styles['kiosk-route']}>
          <Outlet />
        </Fade>
      </ScrollArea>
      {isActive &&
        (isSkeletonPreview(search) ? (
          <KioskFooterSkeleton />
        ) : (
          <KioskFooter onEndSession={handleEndSession} />
        ))}
      {import.meta.env.DEV && <DeveloperControls />}
      <SessionWarning
        open={idle.isWarning}
        secondsLeft={idle.secondsLeft}
        onContinue={idle.continueSession}
        onEndSession={handleEndSession}
      />
    </div>
  );
}
