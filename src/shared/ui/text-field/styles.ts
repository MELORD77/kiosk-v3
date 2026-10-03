import { cn } from '@/shared/lib/classnames';

export const styles = {
  'text-field': cn(
    'text-field',
    'w-full min-h-[56px] bg-kiosk-surface border-2 border-solid border-kiosk-border-strong rounded-kiosk-sm',
    "text-kiosk-text py-kiosk-3 px-kiosk-4 [&[aria-invalid='true']]:border-kiosk-danger",
  ),
} as const;
