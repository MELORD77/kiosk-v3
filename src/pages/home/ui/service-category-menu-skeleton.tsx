import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/shared/ui/skeleton';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Loader } from '@/shared/ui/loader';
import {
  localizedCatalogName,
  type ServiceCategory,
} from '@/entities/service-catalog';

const categoryKeys = ['all', 'mig', 'reg', 'cert', 'road', 'permit', 'protect'];

interface ServiceCategoryMenuSkeletonProps {
  categories?: readonly ServiceCategory[];
}

export function ServiceCategoryMenuSkeleton({
  categories,
}: ServiceCategoryMenuSkeletonProps) {
  const { t, i18n } = useTranslation();
  const total = categories?.reduce(
    (count, category) => count + category.servicesCount,
    0,
  );
  const knownCategories = categories?.map((category) => ({
    key: category.key,
    label: localizedCatalogName(category.lang, i18n.language),
    count: category.servicesCount,
  }));
  const fallbackCategories = categoryKeys
    .slice(1)
    .map((key) => ({ key, label: t(`categories.${key}`), count: 0 }));
  const items = [
    { key: 'all', label: t('categories.all'), count: total ?? '00' },
    ...(knownCategories ?? fallbackCategories),
  ];
  return (
    <ScrollArea
      as="nav"
      className="service-categories [&_>_.status-panel]:flex-col [&_>_.status-panel]:p-kiosk-6 grid gap-kiosk-2 h-full overflow-auto content-start p-kiosk-1 [&_>_.status-panel]:w-full [&_>_.category-loading]:w-full [[data-orientation='portrait']_&]:flex [[data-orientation='portrait']_&]:flex-wrap [[data-orientation='portrait']_&]:h-auto compact:flex compact:flex-wrap compact:h-auto compact:flex-none compact:w-full"
      aria-label={t('home.categories')}
      aria-busy="true"
    >
      <Loader className="sr-only" />
      {items.map((item) => (
        <div
          key={item.key}
          className="button gap-kiosk-3 font-bold leading-[1.3] no-underline [&:disabled]:cursor-not-allowed category-button [&.button--primary]:bg-none [[data-orientation='portrait']_&]:text-kiosk-sm [[data-orientation='portrait']_&]:flex-[1_1_30%] short-wide:min-h-[56px] short-wide:text-kiosk-sm category-skeleton justify-between text-left text-kiosk-description rounded-kiosk-sm py-kiosk-3 px-kiosk-4 min-h-[64px] flex items-center border border-solid border-kiosk-control-border bg-kiosk-surface cursor-default [[data-orientation='portrait']_&]:min-h-[56px] compact:flex-[1_1_45%] compact:min-h-[48px] compact:text-kiosk-sm compact:p-kiosk-3 compact:[[data-orientation='portrait']_&]:flex-[1_1_45%] compact:[[data-orientation='portrait']_&]:min-h-[48px] compact:[[data-orientation='portrait']_&]:text-kiosk-sm compact:[[data-orientation='portrait']_&]:p-kiosk-3"
          aria-hidden="true"
        >
          <span>
            <Skeleton variant="text">{item.label}</Skeleton>
          </span>
          <Skeleton variant="badge" className="category-count flex-none">
            {item.count}
          </Skeleton>
        </div>
      ))}
    </ScrollArea>
  );
}
