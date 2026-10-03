import { styles } from './styles';
import { Skeleton } from '@/shared/ui/skeleton';

interface StatusPanelSkeletonProps {
  title: string;
  description?: string;
  action?: string;
}

export function StatusPanelSkeleton({
  title,
  description,
  action,
}: StatusPanelSkeletonProps) {
  return (
    <div className={styles['status-panel']} aria-hidden="true">
      <Skeleton variant="icon" className={styles['status-panel-icon']} />
      <div className={styles['status-panel-content']}>
        <h2>
          <Skeleton variant="text">{title}</Skeleton>
        </h2>
        {description && (
          <p>
            <Skeleton variant="text">{description}</Skeleton>
          </p>
        )}
        {action && (
          <div className={styles['status-panel-actions']}>
            <Skeleton variant="button">{action}</Skeleton>
          </div>
        )}
      </div>
    </div>
  );
}
