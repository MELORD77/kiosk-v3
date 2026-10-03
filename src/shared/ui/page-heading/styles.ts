import { cn } from '@/shared/lib/classnames';

export const styles = {
  'page-heading': cn(
    'page-heading',
    'text-kiosk-page-heading leading-[1.15] font-extrabold tracking-[-0.025em]',
  ),
  'page-subtitle': cn(
    'page-subtitle',
    'text-kiosk-text-muted text-kiosk-description mt-kiosk-3',
  ),
} as const;
