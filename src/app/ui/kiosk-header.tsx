import { styles } from './styles';
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
    <header className={styles['kiosk-header']}>
      <div className={styles['kiosk-brand']}>
        <img
          className={styles['kiosk-emblem']}
          src="/logo/logo-iiv.png"
          alt={t('brand.emblem')}
        />
        <div>
          <p className={styles['brand-republic']}>{t('brand.republic')}</p>
          <p className={styles['brand-ministry']}>{t('brand.ministry')}</p>
        </div>
      </div>
      <div className={styles['kiosk-header-actions']}>
        <time className={styles['kiosk-clock']} dateTime={now.toISOString()}>
          <span className={styles['clock-date']}>
            <span className={styles['clock-day']}>{displayDay}</span>
            <span className={styles['clock-calendar-details']}>
              <span className={styles['clock-month-year']}>{monthYear}</span>
              <span className={styles['clock-weekday']}>{weekday}</span>
            </span>
          </span>
          <span className={styles['clock-time-block']}>
            <span className={styles['clock-time']}>{time}</span>
            <span className={styles['clock-timezone']}>
              {t('calendar.timezone')}
            </span>
          </span>
        </time>
        <ThemeToggle />
      </div>
    </header>
  );
}
