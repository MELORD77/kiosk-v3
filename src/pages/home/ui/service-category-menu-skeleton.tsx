import { styles } from './styles';
import { buttonStyles } from '@/shared/ui/button';
import { cn } from '@/shared/lib/classnames';
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
      className={styles['service-categories']}
      aria-label={t('home.categories')}
      aria-busy="true"
    >
      <Loader className={'sr-only'} />
      {items.map((item) => (
        <div
          key={item.key}
          className={cn(
            buttonStyles['button'],
            styles['category-button'],
            styles['category-skeleton'],
          )}
          aria-hidden="true"
        >
          <span>
            <Skeleton variant="text">{item.label}</Skeleton>
          </span>
          <Skeleton variant="badge" className={styles['category-count']}>
            {item.count}
          </Skeleton>
        </div>
      ))}
    </ScrollArea>
  );
}
