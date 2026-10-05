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
      className="service-categories [&_>_.status-panel]:flex-col [&_>_.status-panel]:p-kiosk-6 grid gap-kiosk-2 h-full overflow-auto content-start p-kiosk-1 [&_>_.status-panel]:w-full [&_>_.category-loading]:w-full [[data-orientation='portrait']_&]:flex [[data-orientation='portrait']_&]:flex-wrap [[data-orientation='portrait']_&]:h-auto compact:flex compact:flex-wrap compact:h-auto compact:flex-none compact:w-full"
      aria-label={t('home.categories')}
    >
      <Button
        variant={allSelected ? 'primary' : 'secondary'}
        className="category-button justify-between text-left text-kiosk-description rounded-kiosk-sm py-kiosk-3 px-kiosk-4 min-h-[64px] [&.button--primary]:bg-none [[data-orientation='portrait']_&]:min-h-[56px] [[data-orientation='portrait']_&]:text-kiosk-sm [[data-orientation='portrait']_&]:flex-[1_1_30%] short-wide:min-h-[56px] short-wide:text-kiosk-sm compact:flex-[1_1_45%] compact:min-h-[48px] compact:text-kiosk-sm compact:p-kiosk-3 compact:[[data-orientation='portrait']_&]:flex-[1_1_45%] compact:[[data-orientation='portrait']_&]:min-h-[48px] compact:[[data-orientation='portrait']_&]:text-kiosk-sm compact:[[data-orientation='portrait']_&]:p-kiosk-3"
        aria-pressed={allSelected}
        onClick={() => onSelect(undefined)}
      >
        <span>{t('categories.all')}</span>
        {query.isSuccess && (
          <Badge
            tone={allSelected ? 'selected' : 'neutral'}
            className="category-count flex-none"
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
              className="category-button justify-between text-left text-kiosk-description rounded-kiosk-sm py-kiosk-3 px-kiosk-4 min-h-[64px] [&.button--primary]:bg-none [[data-orientation='portrait']_&]:min-h-[56px] [[data-orientation='portrait']_&]:text-kiosk-sm [[data-orientation='portrait']_&]:flex-[1_1_30%] short-wide:min-h-[56px] short-wide:text-kiosk-sm compact:flex-[1_1_45%] compact:min-h-[48px] compact:text-kiosk-sm compact:p-kiosk-3 compact:[[data-orientation='portrait']_&]:flex-[1_1_45%] compact:[[data-orientation='portrait']_&]:min-h-[48px] compact:[[data-orientation='portrait']_&]:text-kiosk-sm compact:[[data-orientation='portrait']_&]:p-kiosk-3"
              aria-pressed={isSelected}
              onClick={() => onSelect(category.key)}
            >
              <span>{localizedCatalogName(category.lang, i18n.language)}</span>
              <Badge
                tone={isSelected ? 'selected' : 'neutral'}
                className="category-count flex-none"
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
