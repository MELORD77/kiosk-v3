import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { Button } from '@/shared/ui/button';
import { StatusPanel, StatusPanelSkeleton } from '@/shared/ui/status-panel';
import { Loader } from '@/shared/ui/loader';
import { isSkeletonPreview } from '@/shared/lib/skeleton-preview';

export function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { search } = useLocation();
  if (isSkeletonPreview(search))
    return (
      <div
        className="page-container py-kiosk-10 px-kiosk-page-gutter page-container--narrow w-[min(100%,_1000px)] mx-auto placeholder-page flex-1 grid content-center gap-kiosk-6"
        aria-busy="true"
      >
        <Loader className="sr-only" />
        <StatusPanelSkeleton
          title={t('notFound.title')}
          description={t('notFound.description')}
          action={t('common.home')}
        />
      </div>
    );
  return (
    <div className="page-container py-kiosk-10 px-kiosk-page-gutter page-container--narrow w-[min(100%,_1000px)] mx-auto placeholder-page flex-1 grid content-center gap-kiosk-6">
      <StatusPanel
        icon="not-found"
        title={t('notFound.title')}
        description={t('notFound.description')}
      >
        <Button
          onClick={() => {
            void navigate('/');
          }}
        >
          {t('common.home')}
        </Button>
      </StatusPanel>
    </div>
  );
}
