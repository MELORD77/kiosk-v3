import { Loader } from '@/shared/ui/loader';
import { Skeleton } from '@/shared/ui/skeleton';
import { useTranslation } from 'react-i18next';
import {
  localizedCatalogName,
  type ServiceSummary,
} from '@/entities/service-catalog';

interface ServiceGridSkeletonProps {
  services?: readonly ServiceSummary[];
  categoryNames?: ReadonlyMap<string, string>;
}

export function ServiceGridSkeleton({
  services,
  categoryNames,
}: ServiceGridSkeletonProps) {
  const { t, i18n } = useTranslation();
  const items = Array.from({ length: 6 }, (_, index) => {
    const service = services?.[index];
    return {
      number: service ? String(service.number).padStart(2, '0') : '00',
      category: service
        ? categoryNames?.get(service.category)
        : t('categories.mig'),
      title: service
        ? localizedCatalogName(service.lang, i18n.language)
        : t(`services.service-${index + 1}`),
      status: t(`serviceStatus.${service?.status ?? 'ACTIVE'}`),
      isAvailable: !service || service.status === 'ACTIVE',
    };
  });
  return (
    <div
      className="service-grid-content grid grid-cols-[repeat(2,_minmax(0,_1fr))] auto-rows-[1fr] gap-kiosk-6 compact:grid-cols-[1fr] service-grid-loading relative"
      aria-busy="true"
    >
      <Loader className="sr-only" />
      {items.map((item, index) => (
        <div
          key={index}
          className="button font-bold leading-[1.3] no-underline [&:disabled]:cursor-not-allowed button--secondary text-kiosk-text [&:enabled:hover]:border-kiosk-control-primary [&:enabled:focus-visible]:border-kiosk-control-primary service-card-skeleton flex items-stretch justify-start flex-col text-left gap-kiosk-3 p-kiosk-4 min-h-[136px] h-auto self-stretch rounded-[var(--radius-service-card)] border border-solid border-kiosk-service-card-border shadow-kiosk-card bg-kiosk-surface cursor-default [[data-orientation='portrait']_&]:min-h-[192px] medium:min-h-[136px] compact:min-h-[136px] compact:[[data-orientation='portrait']_&]:min-h-[136px]"
          aria-hidden="true"
        >
          <div className="service-card-top flex items-center justify-between gap-kiosk-3 shrink-0">
            <div className="service-card-meta flex items-center min-w-0 gap-kiosk-2">
              <Skeleton
                variant="badge"
                className="service-number py-kiosk-1 px-kiosk-2 min-w-[44px] min-h-[36px] grid place-items-center flex-none text-kiosk-md font-extrabold bg-kiosk-service-card-number text-kiosk-service-card-accent"
              >
                {item.number}
              </Skeleton>
              {item.category && (
                <span className="service-category text-kiosk-text-muted text-kiosk-description font-semibold leading-[1.2] min-w-0 wrap-anywhere">
                  <Skeleton variant="text">{item.category}</Skeleton>
                </span>
              )}
            </div>
          </div>
          <div className="service-card-body flex items-center gap-kiosk-3 min-w-0 flex-1">
            <div className="service-card-title text-kiosk-service-title font-bold leading-[1.3] min-w-0 flex-1 wrap-anywhere [[data-orientation='portrait']_&]:text-kiosk-service-title">
              <Skeleton variant="text">{item.title}</Skeleton>
            </div>
            {item.isAvailable && (
              <Skeleton
                variant="icon"
                className="service-card-arrow w-kiosk-8 h-kiosk-8 text-kiosk-service-card-accent flex-none grid place-items-center [&_svg]:w-full [&_svg]:h-full"
              />
            )}
          </div>
          <Skeleton
            variant="badge"
            className="service-status self-start mt-auto gap-kiosk-2 text-kiosk-sm font-semibold text-left whitespace-normal wrap-anywhere py-kiosk-1 px-kiosk-3"
          >
            <span className="inline-flex items-center gap-kiosk-2">
              <span className="service-status-dot w-kiosk-2 h-kiosk-2 rounded-full bg-current flex-none" />
              {item.status}
            </span>
          </Skeleton>
        </div>
      ))}
    </div>
  );
}
