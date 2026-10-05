import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getKioskDateParts } from '@/shared/lib/date';
import { useLocation } from 'react-router';
import { isSkeletonPreview } from '@/shared/lib/skeleton-preview';
import { KioskHeaderSkeleton } from './kiosk-header-skeleton';
import { ThemeToggle } from './theme-toggle';

export function KioskHeader() {
  const { t } = useTranslation();
  const { search } = useLocation();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const { day, year, monthIndex, weekdayIndex, time } = getKioskDateParts(now);
  const displayDay = String(day).padStart(2, '0');
  const monthYear = t('calendar.monthYear', {
    month: t(`calendar.months.${monthIndex}`),
    year,
  });
  const weekday = t(`calendar.weekdays.${weekdayIndex}`);

  if (isSkeletonPreview(search))
    return (
      <KioskHeaderSkeleton
        day={displayDay}
        monthYear={monthYear}
        weekday={weekday}
        time={time}
      />
    );

  return (
    <header className="kiosk-header flex items-center justify-between gap-kiosk-6 min-h-[96px] py-kiosk-3 px-kiosk-page-gutter bg-kiosk-shell-surface [border-bottom:1px_solid_var(--color-border)] medium:min-h-[80px] medium:gap-kiosk-4 short-wide:min-h-[80px] short-wide:py-kiosk-2 compact:items-start compact:flex-wrap">
      <div className="kiosk-brand flex items-center gap-kiosk-4 min-w-0 medium:gap-kiosk-3">
        <img
          className="kiosk-emblem w-[64px] h-[64px] flex-none object-contain medium:w-[48px] medium:h-[48px] short-wide:w-[56px] short-wide:h-[56px] compact:w-[48px] compact:h-[48px]"
          src={`${import.meta.env.BASE_URL}logo/logo-iiv.png`}
          alt={t('brand.emblem')}
        />
        <div>
          <p className="brand-republic text-kiosk-text-muted text-kiosk-brand-republic font-semibold uppercase tracking-[0.06em]">
            {t('brand.republic')}
          </p>
          <p className="brand-ministry mt-kiosk-1 text-kiosk-brand-ministry font-bold leading-[1.15]">
            {t('brand.ministry')}
          </p>
        </div>
      </div>
      <div className="kiosk-header-actions flex items-center gap-kiosk-6 flex-none compact:w-full compact:gap-kiosk-3">
        <time
          className="kiosk-clock flex items-center gap-kiosk-6 flex-none compact:flex-1 compact:min-w-0 compact:flex-wrap compact:justify-between compact:gap-kiosk-2"
          dateTime={now.toISOString()}
        >
          <span className="clock-date flex items-center gap-kiosk-3">
            <span className="clock-day text-kiosk-2xl font-bold tabular-nums leading-none compact:text-kiosk-lg">
              {displayDay}
            </span>
            <span className="clock-calendar-details flex flex-col gap-kiosk-1">
              <span className="clock-month-year text-kiosk-sm text-kiosk-primary font-semibold uppercase tracking-wide whitespace-nowrap compact:text-kiosk-xs">
                {monthYear}
              </span>
              <span className="clock-weekday text-kiosk-xs text-kiosk-text font-semibold capitalize">
                {weekday}
              </span>
            </span>
          </span>
          <span className="clock-time-block flex flex-col gap-kiosk-1 border-l border-solid border-kiosk-border pl-kiosk-6 compact:pl-kiosk-4">
            <span className="clock-time text-kiosk-2xl text-kiosk-primary font-semibold tabular-nums leading-none tracking-tight compact:text-kiosk-lg">
              {time}
            </span>
            <span className="clock-timezone text-kiosk-xs text-kiosk-text-muted whitespace-nowrap">
              {t('calendar.timezone')}
            </span>
          </span>
        </time>
        <ThemeToggle />
      </div>
    </header>
  );
}
