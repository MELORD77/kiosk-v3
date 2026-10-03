import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { isSkeletonPreview } from '@/shared/lib/skeleton-preview';
import {
  localizedCatalogName,
  useServiceCategories,
} from '@/entities/service-catalog';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { StatusPanel } from '@/shared/ui/status-panel';
import { ServiceCategoryMenuSkeleton } from './service-category-menu-skeleton';

interface ServiceCategoryMenuProps {
  selected: string | undefined;
  onSelect: (category: string | undefined) => void;
}

export function ServiceCategoryMenu({
  selected,
  onSelect,
}: ServiceCategoryMenuProps) {
  const { t, i18n } = useTranslation();
  const query = useServiceCategories();
  const { search } = useLocation();
  const categories = query.data ?? [];
  const total = categories.reduce(
    (count, item) => count + item.servicesCount,
    0,
  );
  const allSelected = selected === undefined;

  if (query.isPending || isSkeletonPreview(search))
    return <ServiceCategoryMenuSkeleton categories={query.data} />;

  return (
    <ScrollArea
      as="nav"
      className={styles['service-categories']}
      aria-label={t('home.categories')}
    >
      <Button
        variant={allSelected ? 'primary' : 'secondary'}
        className={styles['category-button']}
        aria-pressed={allSelected}
        onClick={() => onSelect(undefined)}
      >
        <span>{t('categories.all')}</span>
        {query.isSuccess && (
          <Badge
            tone={allSelected ? 'selected' : 'neutral'}
            className={styles['category-count']}
            aria-hidden="true"
          >
            {total}
          </Badge>
        )}
      </Button>
      {query.isError && (
        <StatusPanel
          tone="error"
          title={t('catalog.categoriesErrorTitle')}
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
      {query.isSuccess && categories.length === 0 && (
        <StatusPanel
          icon="empty"
          title={t('catalog.categoriesEmptyTitle')}
          description={t('catalog.categoriesEmptyDescription')}
        >
          <Button
            variant="secondary"
            disabled={query.isFetching}
            onClick={() => {
              void query.refetch();
            }}
          >
            {t('common.retry')}
          </Button>
        </StatusPanel>
      )}
      {query.isSuccess &&
        categories.map((category) => {
          const isSelected = selected === category.key;
          return (
            <Button
              key={category.key}
              variant={isSelected ? 'primary' : 'secondary'}
              className={styles['category-button']}
              aria-pressed={isSelected}
              onClick={() => onSelect(category.key)}
            >
              <span>{localizedCatalogName(category.lang, i18n.language)}</span>
              <Badge
                tone={isSelected ? 'selected' : 'neutral'}
                className={styles['category-count']}
                aria-hidden="true"
              >
                {category.servicesCount}
              </Badge>
            </Button>
          );
        })}
    </ScrollArea>
  );
}
