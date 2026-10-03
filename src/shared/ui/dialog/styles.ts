import { cn } from '@/shared/lib/classnames';

export const styles = {
  dialog: cn(
    'dialog',
    'max-w-[min(600px,_calc(100%_-_var(--space-8)))] max-h-[calc(100dvh_-_var(--space-8))] w-full m-auto overflow-auto border border-solid',
    'border-kiosk-border rounded-kiosk-lg bg-kiosk-surface text-kiosk-text p-kiosk-10 [&::backdrop]:bg-kiosk-dialog-backdrop',
  ),
} as const;
