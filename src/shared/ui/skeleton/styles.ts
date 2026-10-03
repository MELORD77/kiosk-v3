import { cn } from '@/shared/lib/classnames';

export const styles = {
  skeleton: cn(
    'skeleton',
    'block bg-kiosk-surface-muted rounded-kiosk-sm animate-kiosk-skeleton pointer-events-none select-none [&.status-panel-icon]:rounded-kiosk-sm',
    '[&.service-card-arrow]:bg-kiosk-surface-muted [&.circle-arrow]:bg-kiosk-surface-muted',
    '[&.service-card-arrow]:rounded-kiosk-sm [&.circle-arrow]:rounded-kiosk-sm',
  ),
  'skeleton--badge': cn('skeleton--badge', 'inline-flex'),
  'skeleton--box': cn('skeleton--box', 'h-kiosk-6 w-full'),
  'skeleton--button': cn('skeleton--button', 'inline-flex cursor-default'),
  'skeleton--icon': cn(
    'skeleton--icon',
    '[:where(&)]:w-kiosk-6 [:where(&)]:h-kiosk-6 [:where(&)]:flex-none rounded-[50%]',
  ),
  'skeleton--input': cn('skeleton--input', 'overflow-hidden whitespace-nowrap'),
  'skeleton--text': cn(
    'skeleton--text',
    'inline rounded-kiosk-sm [box-decoration-break:clone] [-webkit-box-decoration-break:clone]',
  ),
  'skeleton-measure': cn('skeleton-measure', 'invisible'),
} as const;
