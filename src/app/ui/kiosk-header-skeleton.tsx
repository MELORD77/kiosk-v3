import { styles } from './styles';
import { cn } from '@/shared/lib/classnames';
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
      className={cn(styles['kiosk-header'], 'kiosk-header-skeleton')}
      aria-busy="true"
    >
      <Loader className={'sr-only'} />
      <div className={styles['kiosk-brand']} aria-hidden="true">
        <Skeleton variant="icon" className={styles['kiosk-emblem']} />
        <div>
          <p className={styles['brand-republic']}>
            <Skeleton variant="text">{t('brand.republic')}</Skeleton>
          </p>
          <p className={styles['brand-ministry']}>
            <Skeleton variant="text">{t('brand.ministry')}</Skeleton>
          </p>
        </div>
      </div>
      <div className={styles['kiosk-header-actions']} aria-hidden="true">
        <div className={styles['kiosk-clock']}>
          <span className={styles['clock-date']}>
            <span className={styles['clock-day']}>
              <Skeleton variant="text">{day}</Skeleton>
            </span>
            <span className={styles['clock-calendar-details']}>
              <span className={styles['clock-month-year']}>
                <Skeleton variant="text">{monthYear}</Skeleton>
              </span>
              <span className={styles['clock-weekday']}>
                <Skeleton variant="text">{weekday}</Skeleton>
              </span>
            </span>
          </span>
          <span className={styles['clock-time-block']}>
            <span className={styles['clock-time']}>
              <Skeleton variant="text">{time}</Skeleton>
            </span>
            <span className={styles['clock-timezone']}>
              <Skeleton variant="text">{t('calendar.timezone')}</Skeleton>
            </span>
          </span>
        </div>
        <Skeleton variant="button" className={styles['theme-toggle']} />
      </div>
    </header>
  );
}
