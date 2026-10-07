import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { localizedCatalogName, useService } from '@/entities/service-catalog';
import { ApiError } from '@/shared/api';
import { Button } from '@/shared/ui/button';
import { StatusPanel } from '@/shared/ui/status-panel';
import { Loader } from '@/shared/ui/loader';
import { isSkeletonPreview } from '@/shared/lib/skeleton-preview';
import { ServiceOverviewSkeleton } from './service-overview-skeleton';
import { ServiceFlow } from './service-flow';

export function ServiceDetailPage({ serviceId }: { serviceId: string }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { search } = useLocation();
  const query = useService(serviceId);
  const isNotFound =
    query.error instanceof ApiError && query.error.status === 404;

  function goHome() {
    void navigate('/home');
  }

  if (query.isPending || isSkeletonPreview(search)) {
    return (
      <div
        className="identity-page py-kiosk-service-gap px-kiosk-page-gutter flex-1 min-w-0 flex"
        aria-busy="true"
      >
        <Loader className="sr-only" />
        <ServiceOverviewSkeleton
          service={query.data}
          serviceName={
            query.data
              ? localizedCatalogName(query.data.lang, i18n.language)
              : undefined
          }
        />
      </div>
    );
  }

  if (query.isSuccess) {
    if (query.data.status !== 'ACTIVE') {
      return (
        <div className="identity-page py-kiosk-service-gap px-kiosk-page-gutter flex-1 min-w-0 flex">
          <section className="service-flow w-full max-w-360 mx-auto flex flex-col gap-kiosk-6 short:gap-kiosk-4">
            <div className="grid [&_h1]:font-extrabold [&_h1]:leading-[1.2] [&_p]:text-kiosk-text-muted gap-kiosk-2 [&_h1]:text-kiosk-lg [&_p]:text-kiosk-sm">
              <h1>{localizedCatalogName(query.data.lang, i18n.language)}</h1>
            </div>
            <StatusPanel
              title={t(`serviceStatus.${query.data.status}`)}
              description={t(`serviceStatus.${query.data.status}Description`)}
            />
            <div className="actions flex flex-wrap gap-kiosk-3">
              <Button onClick={goHome}>{t('common.home')}</Button>
            </div>
          </section>
        </div>
      );
    }
    return (
      <div className="identity-page py-kiosk-service-gap px-kiosk-page-gutter flex-1 min-w-0 flex">
        <ServiceFlow
          key={query.data.id}
          service={query.data}
          serviceName={localizedCatalogName(query.data.lang, i18n.language)}
          onHome={goHome}
        />
      </div>
    );
  }

  return (
    <div className="page-container py-kiosk-10 px-kiosk-page-gutter page-container--narrow w-[min(100%,_1000px)] mx-auto placeholder-page flex-1 grid content-center gap-kiosk-6">
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
      <div className="actions flex flex-wrap gap-kiosk-3">
        <Button onClick={goHome}>{t('common.home')}</Button>
      </div>
    </div>
  );
}
