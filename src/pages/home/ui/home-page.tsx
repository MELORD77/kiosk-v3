import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { ServiceGrid } from './service-grid';
import { ServiceCategoryMenu } from './service-category-menu';
import { PageHeading, PageHeadingSkeleton } from '@/shared/ui/page-heading';
import { isSkeletonPreview } from '@/shared/lib/skeleton-preview';

export function HomePage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || undefined;
  const Heading = isSkeletonPreview(searchParams.toString())
    ? PageHeadingSkeleton
    : PageHeading;

  function selectCategory(nextCategory: string | undefined) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (nextCategory === undefined) next.delete('category');
      else next.set('category', nextCategory);
      return next;
    });
  }

  return (
    <div className={styles['home-page']}>
      <Heading
        className={styles['home-intro']}
        title={t('home.title')}
        description={t('home.subtitle')}
      />
      <div className={styles['home-layout']}>
        <ServiceCategoryMenu selected={category} onSelect={selectCategory} />
        <ServiceGrid
          category={category}
          onClearCategory={() => selectCategory(undefined)}
        />
      </div>
    </div>
  );
}
