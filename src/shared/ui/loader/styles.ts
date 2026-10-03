import { cn } from '@/shared/lib/classnames';

export const styles = {
  loader: cn(
    'loader',
    'flex items-center justify-center gap-kiosk-3 p-kiosk-4 text-kiosk-text-muted font-semibold',
  ),
  'loader-spinner': cn(
    'loader-spinner',
    'w-kiosk-8 h-kiosk-8 flex-none border-[length:var(--space-1)] border-solid border-kiosk-border border-t-kiosk-primary',
    'rounded-[50%] animate-kiosk-loader',
  ),
} as const;
