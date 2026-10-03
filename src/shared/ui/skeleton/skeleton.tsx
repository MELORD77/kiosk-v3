import { styles } from './styles';
import { buttonStyles } from '@/shared/ui/button';
import { textFieldStyles } from '@/shared/ui/text-field';
import { badgeStyles } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/classnames';
import type { ReactNode } from 'react';

interface SkeletonProps {
  variant?: 'text' | 'icon' | 'badge' | 'button' | 'input' | 'box';
  children?: ReactNode;
  className?: string;
}

export function Skeleton({
  variant = 'box',
  children,
  className,
}: SkeletonProps) {
  return (
    <span
      className={cn(
        variant === 'button' && buttonStyles.button,
        variant === 'input' && textFieldStyles['text-field'],
        variant === 'badge' && badgeStyles.badge,
        styles.skeleton,
        styles[`skeleton--${variant}`],
        className,
      )}
      aria-hidden="true"
    >
      {children !== undefined && (
        <span className={styles['skeleton-measure']}>{children}</span>
      )}
    </span>
  );
}
