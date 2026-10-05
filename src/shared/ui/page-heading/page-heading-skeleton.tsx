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
      <div className="page-heading text-kiosk-page-heading leading-[1.15] font-extrabold tracking-[-0.025em]">
        <Skeleton variant="text">{title}</Skeleton>
      </div>
      {description && (
        <p className="page-subtitle text-kiosk-text-muted text-kiosk-description mt-kiosk-3">
          <Skeleton variant="text">{description}</Skeleton>
        </p>
      )}
    </div>
  );
}
