import { styles } from './styles';
import { cn } from '@/shared/lib/classnames';
import type { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'primary' | 'selected';
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(styles.badge, styles[`badge--${tone}`], className)}
      {...props}
    />
  );
}
