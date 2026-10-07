import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/shared/ui/skeleton';
import { Loader } from '@/shared/ui/loader';

interface KioskHeaderSkeletonProps {
  day: string;
  monthYear: string;
  weekday: string;
  time: string;
}

export function KioskHeaderSkeleton({
  day,
  monthYear,
  weekday,
  time,
}: KioskHeaderSkeletonProps) {
  const { t } = useTranslation();
  return (
    <header
      className="kiosk-header shrink-0 flex items-center justify-between gap-kiosk-6 min-h-[96px] py-kiosk-3 px-kiosk-page-gutter bg-kiosk-shell-surface [border-bottom:1px_solid_var(--color-border)] medium:min-h-[80px] medium:gap-kiosk-4 short-wide:min-h-[80px] short-wide:py-kiosk-2 compact:items-start compact:flex-wrap short:gap-kiosk-2 short:py-kiosk-2 kiosk-header-skeleton"
      aria-busy="true"
    >
      <Loader className="sr-only" />
      <div
        className="kiosk-brand flex items-center gap-kiosk-4 min-w-0 medium:gap-kiosk-3"
        aria-hidden="true"
      >
        <Skeleton
          variant="icon"
          className="kiosk-emblem w-[64px] h-[64px] flex-none object-contain medium:w-[48px] medium:h-[48px] short-wide:w-[56px] short-wide:h-[56px] short:w-kiosk-12 short:h-kiosk-12 compact:w-[48px] compact:h-[48px]"
        />
        <div>
          <p className="brand-republic text-kiosk-text-muted text-kiosk-brand-republic font-semibold uppercase tracking-[0.06em]">
            <Skeleton variant="text">{t('brand.republic')}</Skeleton>
          </p>
          <p className="brand-ministry mt-kiosk-1 text-kiosk-brand-ministry font-bold leading-[1.15]">
            <Skeleton variant="text">{t('brand.ministry')}</Skeleton>
          </p>
        </div>
      </div>
      <div
        className="kiosk-header-actions flex items-center gap-kiosk-6 flex-none compact:w-full compact:gap-kiosk-3"
        aria-hidden="true"
      >
        <div className="kiosk-clock flex items-center gap-kiosk-6 flex-none compact:flex-1 compact:min-w-0 compact:flex-wrap compact:justify-between compact:gap-kiosk-2">
          <span className="clock-date flex items-center gap-kiosk-3">
            <span className="clock-day text-kiosk-2xl font-bold tabular-nums leading-none compact:text-kiosk-lg">
              <Skeleton variant="text">{day}</Skeleton>
            </span>
            <span className="clock-calendar-details flex flex-col gap-kiosk-1">
              <span className="clock-month-year text-kiosk-sm text-kiosk-primary font-semibold uppercase tracking-wide whitespace-nowrap compact:text-kiosk-xs">
                <Skeleton variant="text">{monthYear}</Skeleton>
              </span>
              <span className="clock-weekday text-kiosk-xs text-kiosk-text font-semibold capitalize">
                <Skeleton variant="text">{weekday}</Skeleton>
              </span>
            </span>
          </span>
          <span className="clock-time-block flex flex-col gap-kiosk-1 border-l border-solid border-kiosk-border pl-kiosk-6 compact:pl-kiosk-4">
            <span className="clock-time text-kiosk-2xl text-kiosk-primary font-semibold tabular-nums leading-none tracking-tight compact:text-kiosk-lg">
              <Skeleton variant="text">{time}</Skeleton>
            </span>
            <span className="clock-timezone text-kiosk-xs text-kiosk-text-muted whitespace-nowrap">
              <Skeleton variant="text">{t('calendar.timezone')}</Skeleton>
            </span>
          </span>
        </div>
        <Skeleton
          variant="button"
          className="theme-toggle flex-none w-kiosk-16 min-h-kiosk-16 p-kiosk-4 rounded-kiosk-sm text-kiosk-control-primary [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6 compact:w-[56px] compact:min-h-[56px] compact:p-kiosk-3 compact:rounded-kiosk-sm"
        />
      </div>
    </header>
  );
}
