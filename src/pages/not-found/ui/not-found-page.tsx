import { layoutStyles } from '@/shared/lib/ui-styles';
import { styles } from './styles';
import { cn } from '@/shared/lib/classnames';
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
        className={cn(
          layoutStyles['page-container'],
          layoutStyles['page-container--narrow'],
          styles['placeholder-page'],
        )}
        aria-busy="true"
      >
        <Loader className={'sr-only'} />
        <StatusPanelSkeleton
          title={t('notFound.title')}
          description={t('notFound.description')}
          action={t('common.home')}
        />
      </div>
    );
  return (
    <div
      className={cn(
        layoutStyles['page-container'],
        layoutStyles['page-container--narrow'],
        styles['placeholder-page'],
      )}
    >
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
