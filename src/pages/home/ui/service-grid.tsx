import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { isSkeletonPreview } from '@/shared/lib/skeleton-preview';
import {
  citizenServiceRoute,
  localizedCatalogName,
  useServiceCategories,
  useServices,
} from '@/entities/service-catalog';
import { Button } from '@/shared/ui/button';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { StatusPanel } from '@/shared/ui/status-panel';
import { Fade } from '@/shared/ui/fade';
import { ServiceCard } from './service-card';
import { ServiceGridSkeleton } from './service-grid-skeleton';

interface ServiceGridProps {
  category: string | undefined;
  onClearCategory: () => void;
}

export function ServiceGrid({ category, onClearCategory }: ServiceGridProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { search } = useLocation();
  const query = useServices(category);
  const categories = useServiceCategories();
  const isLoading = query.isPending || isSkeletonPreview(search);
  const categoryNames = new Map(
    categories.data?.map((item) => [
      item.key,
      localizedCatalogName(item.lang, i18n.language),
    ]),
  );

  return (
    <ScrollArea
      as="section"
      className="service-grid min-h-0 h-full overflow-auto p-kiosk-1 compact:h-auto compact:overflow-visible compact:flex-none compact:w-full"
      aria-label={t('home.services')}
    >
      {isLoading && (
        <ServiceGridSkeleton
          services={query.data}
          categoryNames={categoryNames}
        />
      )}
      {!isLoading && query.isError && (
        <StatusPanel
          tone="error"
          title={t('catalog.servicesErrorTitle')}
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
      {!isLoading && query.isSuccess && query.data.length === 0 && (
        <StatusPanel
          icon="empty"
          title={t('catalog.servicesEmptyTitle')}
          description={t('catalog.servicesEmptyDescription')}
        >
          <div className="actions flex flex-wrap gap-kiosk-3">
            {category && (
              <Button onClick={onClearCategory}>{t('categories.all')}</Button>
            )}
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
      {!isLoading && query.isSuccess && query.data.length > 0 && (
        <Fade
          key={category ?? 'all'}
          className="service-grid-content grid grid-cols-[repeat(2,_minmax(0,_1fr))] auto-rows-[1fr] gap-kiosk-3 compact:grid-cols-[1fr]"
        >
          {query.data.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              categoryName={categoryNames.get(service.category)}
              onSelect={() => {
                void navigate(
                  `/services/${citizenServiceRoute(service.number) ?? service.id}`,
                );
              }}
            />
          ))}
        </Fade>
      )}
    </ScrollArea>
  );
}
