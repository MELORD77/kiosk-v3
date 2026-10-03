import { cn } from '@/shared/lib/classnames';

export const styles = {
  badge: cn(
    'badge',
    'inline-flex items-center justify-center rounded-kiosk-sm py-kiosk-1 px-kiosk-3 tabular-nums',
  ),
  'badge--neutral': cn(
    'badge--neutral',
    'bg-kiosk-surface-muted text-kiosk-text',
  ),
  'badge--primary': cn(
    'badge--primary',
    'bg-kiosk-primary-soft text-kiosk-primary',
  ),
  'badge--selected': cn(
    'badge--selected',
    'bg-kiosk-selected-badge text-kiosk-on-primary',
  ),
} as const;
