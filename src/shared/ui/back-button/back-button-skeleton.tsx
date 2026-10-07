import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/classnames';
import { useBackNavigation } from '@/shared/lib/back-navigation';
import { ArrowIcon } from '@/shared/ui/arrow-icon';
import { Skeleton } from '@/shared/ui/skeleton';
import { backButtonClassName } from './back-button-styles';

interface BackButtonSkeletonProps {
  className?: string;
  placement?: 'content' | 'footer';
}

export function BackButtonSkeleton({
  className,
  placement = 'content',
}: BackButtonSkeletonProps) {
  const { t } = useTranslation();
  const scope = useBackNavigation();
  if (scope?.enabled && placement === 'content') return null;
  return (
    <Skeleton variant="button" className={cn(backButtonClassName, className)}>
      <span className="inline-flex items-center gap-kiosk-3">
        <span className="flex rotate-180">
          <ArrowIcon />
        </span>
        {t('common.back')}
      </span>
    </Skeleton>
  );
}
