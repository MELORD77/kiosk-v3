import { styles } from './styles';
import { cn } from '@/shared/lib/classnames';
import { buttonStyles } from '@/shared/ui/button';
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
    };
  });
  return (
    <div
      className={cn(
        styles['service-grid-content'],
        styles['service-grid-loading'],
      )}
      aria-busy="true"
    >
      <Loader className={'sr-only'} />
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            buttonStyles['button'],
            buttonStyles['button--secondary'],
            styles['service-card-skeleton'],
          )}
          aria-hidden="true"
        >
          <div className={styles['service-card-top']}>
            <div className={styles['service-card-meta']}>
              <Skeleton variant="badge" className={styles['service-number']}>
                {item.number}
              </Skeleton>
              {item.category && (
                <span className={styles['service-category']}>
                  <Skeleton variant="text">{item.category}</Skeleton>
                </span>
              )}
            </div>
            <Skeleton variant="icon" className={styles['service-card-arrow']} />
          </div>
          <div className={styles['service-card-title']}>
            <Skeleton variant="text">{item.title}</Skeleton>
          </div>
        </div>
      ))}
    </div>
  );
}
