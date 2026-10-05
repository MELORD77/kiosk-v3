import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useServices } from '@/entities/service-catalog';
import { Button } from '@/shared/ui/button';
import { Loader } from '@/shared/ui/loader';
import { StatusPanel } from '@/shared/ui/status-panel';
import { ServiceOverviewSkeleton } from './service-overview-skeleton';
import { ServiceDetailPage } from './service-detail-page';

export function NamedServicePage({ number }: { number: number }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const query = useServices();
  const service = query.data?.find((item) => item.number === number);

  if (query.isPending) {
    return (
      <div
        className="identity-page py-kiosk-8 px-kiosk-page-gutter flex-1 flex [@media(height<=1100px)]:py-kiosk-6"
        aria-busy="true"
      >
        <Loader className="sr-only" />
        <ServiceOverviewSkeleton />
      </div>
    );
  }
  if (query.isError) {
    return (
      <div className="identity-page py-kiosk-8 px-kiosk-page-gutter flex-1 flex [@media(height<=1100px)]:py-kiosk-6">
        <StatusPanel
          tone="error"
          title={t('catalog.serviceErrorTitle')}
          description={t('catalog.errorDescription')}
        >
          <Button
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            {t('common.retry')}
          </Button>
        </StatusPanel>
      </div>
    );
  }
  if (!service) {
    return (
      <div className="identity-page py-kiosk-8 px-kiosk-page-gutter flex-1 flex [@media(height<=1100px)]:py-kiosk-6">
        <StatusPanel icon="not-found" title={t('notFound.title')}>
          <Button onClick={() => void navigate('/home')}>
            {t('common.home')}
          </Button>
        </StatusPanel>
      </div>
    );
  }
  return <ServiceDetailPage key={service.id} serviceId={service.id} />;
}
