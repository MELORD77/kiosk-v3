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
    <div className="home-page pt-kiosk-4 pb-kiosk-8 px-kiosk-page-gutter min-h-0 flex flex-col flex-1 gap-kiosk-4 short-wide:pb-kiosk-6 compact:flex-none">
      <Heading
        className="home-intro flex items-baseline justify-between gap-kiosk-8 [&_.page-heading]:text-kiosk-page-heading [&_.page-subtitle]:mt-0 [&_.page-subtitle]:text-kiosk-description [&_.page-subtitle]:flex-none [[data-orientation='portrait']_&]:flex-col [[data-orientation='portrait']_&]:gap-kiosk-3 medium:flex-col medium:gap-kiosk-3 short-wide:[&_.page-heading]:text-kiosk-xl"
        title={t('home.title')}
        description={t('home.subtitle')}
      />
      <div className="home-layout grid grid-cols-[minmax(192px,_320px)_minmax(0,_1fr)] grid-rows-[minmax(0,_1fr)] gap-kiosk-6 items-start min-h-0 flex-1 [[data-orientation='portrait']_&]:grid-cols-[1fr] [[data-orientation='portrait']_&]:grid-rows-[auto_minmax(0,_1fr)] medium:gap-kiosk-4 medium:grid-cols-[192px_minmax(0,_1fr)] medium:[[data-orientation='portrait']_&]:grid-cols-[1fr] compact:flex compact:flex-col compact:min-h-[auto] compact:flex-none">
        <ServiceCategoryMenu selected={category} onSelect={selectCategory} />
        <ServiceGrid
          category={category}
          onClearCategory={() => selectCategory(undefined)}
        />
      </div>
    </div>
  );
}
