import { cn } from '@/shared/lib/classnames';

export const styles = {
  'status-icon': cn('status-icon', 'w-kiosk-8 h-kiosk-8'),
  'status-panel': cn(
    'status-panel',
    'border border-solid border-kiosk-border rounded-kiosk-md p-kiosk-8 flex items-start',
    'gap-kiosk-4 bg-kiosk-surface compact:flex-wrap compact:p-kiosk-6',
  ),
  'status-panel--error': cn(
    'status-panel--error',
    '[&_.status-panel-icon]:text-kiosk-danger [&_.status-panel-icon]:bg-kiosk-danger-soft [&.status-panel--error_p]:text-kiosk-danger-text bg-kiosk-danger-soft text-kiosk-danger-text border-kiosk-danger-border',
  ),
  'status-panel--success': cn(
    'status-panel--success',
    '[&_.status-panel-icon]:text-kiosk-success [&_.status-panel-icon]:bg-kiosk-success-soft bg-kiosk-success-soft text-kiosk-success',
  ),
  'status-panel-actions': cn('status-panel-actions', 'pt-kiosk-1'),
  'status-panel-content': cn(
    'status-panel-content',
    'min-w-0 grid gap-kiosk-3 wrap-anywhere [&_h2]:text-kiosk-md [&_h2]:font-bold [&_h2]:leading-[1.3]',
    '[&_p]:text-kiosk-text-muted [&_p]:leading-[1.5]',
  ),
  'status-panel-icon': cn(
    'status-panel-icon',
    'flex-none grid place-items-center w-kiosk-12 h-kiosk-12 rounded-kiosk-sm bg-kiosk-surface-muted',
    'text-kiosk-primary',
  ),
} as const;
