import { cn } from '@/shared/lib/classnames';

export const styles = {
  'demo-profile': cn(
    'demo-profile',
    'min-h-[96px] p-kiosk-4 rounded-kiosk-md bg-kiosk-surface border border-solid border-kiosk-border',
    'grid gap-kiosk-2 [&_h3]:text-kiosk-md',
  ),
  'demo-profiles': cn(
    'demo-profiles',
    'grid grid-cols-[repeat(2,_minmax(0,_1fr))] gap-kiosk-3 compact:grid-cols-[1fr]',
  ),
} as const;
