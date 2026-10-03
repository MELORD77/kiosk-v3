import { styles } from './styles';
import { layoutStyles } from '@/shared/lib/ui-styles';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { isSkeletonPreview } from '@/shared/lib/skeleton-preview';
import {
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
      className={styles['service-grid']}
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
          <div className={layoutStyles['actions']}>
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
          className={styles['service-grid-content']}
        >
          {query.data.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              categoryName={categoryNames.get(service.category)}
              onSelect={() => {
                void navigate(`/services/${service.id}`);
              }}
            />
          ))}
        </Fade>
      )}
    </ScrollArea>
  );
}
