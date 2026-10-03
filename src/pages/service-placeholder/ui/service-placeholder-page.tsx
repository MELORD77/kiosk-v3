import { styles } from './styles';
import { layoutStyles } from '@/shared/lib/ui-styles';
import { cn } from '@/shared/lib/classnames';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router';
import { localizedCatalogName, useService } from '@/entities/service-catalog';
import { ApiError } from '@/shared/api';
import { Button } from '@/shared/ui/button';
import { StatusPanel } from '@/shared/ui/status-panel';
import { Loader } from '@/shared/ui/loader';
import { isSkeletonPreview } from '@/shared/lib/skeleton-preview';
import { IdentityFormSkeleton } from './identity-form-skeleton';
import { IdentityForm } from './identity-form';

export function ServicePlaceholderPage() {
  const { t, i18n } = useTranslation();
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { search } = useLocation();
  const query = useService(serviceId ?? '');
  const isNotFound =
    query.error instanceof ApiError && query.error.status === 404;

  function goHome() {
    void navigate('/home');
  }

  if (query.isPending || isSkeletonPreview(search)) {
    const serviceName = query.data
      ? localizedCatalogName(query.data.lang, i18n.language)
      : undefined;
    return (
      <div className={styles['identity-page']} aria-busy="true">
        <Loader className={'sr-only'} />
        <IdentityFormSkeleton serviceName={serviceName} />
      </div>
    );
  }

  if (query.isSuccess) {
    return (
      <div className={styles['identity-page']}>
        <IdentityForm
          key={query.data.id}
          serviceName={localizedCatalogName(query.data.lang, i18n.language)}
          onBack={goHome}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        layoutStyles['page-container'],
        layoutStyles['page-container--narrow'],
        styles['placeholder-page'],
      )}
    >
      {query.isError && isNotFound && (
        <StatusPanel
          icon="not-found"
          title={t('notFound.title')}
          description={t('notFound.description')}
        />
      )}
      {query.isError && !isNotFound && (
        <StatusPanel
          tone="error"
          title={t('catalog.serviceErrorTitle')}
          description={t('catalog.errorDescription')}
        >
          <div>
            <Button
              variant="secondary"
              disabled={query.isFetching}
              onClick={() => {
                void query.refetch();
              }}
            >
              {t('common.retry')}
            </Button>
          </div>
        </StatusPanel>
      )}
      <div className={layoutStyles['actions']}>
        <Button onClick={goHome}>{t('common.home')}</Button>
      </div>
    </div>
  );
}
