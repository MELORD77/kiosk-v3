import { styles } from './styles';
import { cn } from '@/shared/lib/classnames';

import { Skeleton } from '@/shared/ui/skeleton';

interface PageHeadingSkeletonProps {
  title: string;
  description?: string;
  className?: string;
}

export function PageHeadingSkeleton({
  title,
  description,
  className,
}: PageHeadingSkeletonProps) {
  return (
    <div className={cn('page-heading-group', className)} aria-hidden="true">
      <div className={styles['page-heading']}>
        <Skeleton variant="text">{title}</Skeleton>
      </div>
      {description && (
        <p className={styles['page-subtitle']}>
          <Skeleton variant="text">{description}</Skeleton>
        </p>
      )}
    </div>
  );
}
