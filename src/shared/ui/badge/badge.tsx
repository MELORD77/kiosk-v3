import { cn } from '@/shared/lib/classnames';
import type { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'primary' | 'selected' | 'success' | 'warning' | 'danger';
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'badge inline-flex items-center justify-center rounded-kiosk-sm py-kiosk-1 px-kiosk-3 tabular-nums',
        tone === 'neutral' &&
          'badge--neutral bg-kiosk-surface-muted text-kiosk-text',
        tone === 'primary' &&
          'badge--primary bg-kiosk-primary-soft text-kiosk-primary',
        tone === 'selected' &&
          'badge--selected bg-kiosk-selected-badge text-kiosk-on-primary',
        tone === 'success' &&
          'badge--success bg-kiosk-success-soft text-kiosk-success ring-inset ring-1 ring-kiosk-success-border',
        tone === 'warning' &&
          'badge--warning bg-kiosk-warning-soft text-kiosk-warning-text ring-inset ring-1 ring-kiosk-warning-border',
        tone === 'danger' &&
          'badge--danger bg-kiosk-danger-soft text-kiosk-danger-text ring-inset ring-1 ring-kiosk-danger-border',
        className,
      )}
      {...props}
    />
  );
}
