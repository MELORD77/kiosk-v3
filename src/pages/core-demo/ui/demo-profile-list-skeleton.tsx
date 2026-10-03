import { styles } from './styles';
import { layoutStyles } from '@/shared/lib/ui-styles';
import { useTranslation } from 'react-i18next';
import { Loader } from '@/shared/ui/loader';
import { Skeleton } from '@/shared/ui/skeleton';

export function DemoProfileListSkeleton() {
  const { t } = useTranslation();
  return (
    <div className={styles['demo-profiles']} aria-busy="true">
      <Loader className={'sr-only'} />
      {['portrait', 'landscape'].map((id) => (
        <div key={id} className={styles['demo-profile']} aria-hidden="true">
          <h3>
            <Skeleton variant="text">{t(`settings.${id}`)}</Skeleton>
          </h3>
          <p className={layoutStyles['muted']}>
            <Skeleton variant="text">
              {id === 'portrait' ? '1080 × 1920' : '1920 × 1080'}
            </Skeleton>
          </p>
        </div>
      ))}
    </div>
  );
}
