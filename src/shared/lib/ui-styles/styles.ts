import { cn } from '@/shared/lib/classnames';

export const layoutStyles = {
  actions: cn('actions', 'flex flex-wrap gap-kiosk-3'),
  muted: cn('muted', 'text-kiosk-text-muted'),
  'page-container': cn('page-container', 'py-kiosk-10 px-kiosk-page-gutter'),
  'page-container--narrow': cn(
    'page-container--narrow',
    'w-[min(100%,_1000px)] mx-auto',
  ),
  stack: cn('stack', 'grid gap-kiosk-6'),
} as const;
