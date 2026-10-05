import { cn } from '@/shared/lib/classnames';
import type { ReactNode } from 'react';
import { Fade } from '@/shared/ui/fade';
import { StatusIcon } from './status-icon';
import type { StatusIconKind } from './status-icon';

interface StatusPanelProps {
  title: string;
  description?: string;
  tone?: 'neutral' | 'error' | 'success';
  children?: ReactNode;
  icon?: StatusIconKind;
}

export function StatusPanel({
  title,
  description,
  tone = 'neutral',
  children,
  icon,
}: StatusPanelProps) {
  const iconKind = icon ?? (tone === 'neutral' ? 'info' : tone);
  const toneClass =
    tone === 'neutral'
      ? 'status-panel--neutral'
      : cn(
          tone === 'error' &&
            'status-panel--error [&_.status-panel-icon]:text-kiosk-danger [&_.status-panel-icon]:bg-kiosk-danger-soft [&.status-panel--error_p]:text-kiosk-danger-text bg-kiosk-danger-soft text-kiosk-danger-text border-kiosk-danger-border',
          tone === 'success' &&
            'status-panel--success [&_.status-panel-icon]:text-kiosk-success [&_.status-panel-icon]:bg-kiosk-success-soft bg-kiosk-success-soft text-kiosk-success',
        );
  return (
    <Fade
      kind="feedback"
      className={cn(
        'status-panel border border-solid border-kiosk-border rounded-kiosk-md p-kiosk-8 flex items-start gap-kiosk-4 bg-kiosk-surface compact:flex-wrap compact:p-kiosk-6',
        toneClass,
      )}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <div className="status-panel-icon flex-none grid place-items-center w-kiosk-12 h-kiosk-12 rounded-kiosk-sm bg-kiosk-surface-muted text-kiosk-primary">
        <StatusIcon kind={iconKind} />
      </div>
      <div className="status-panel-content min-w-0 grid gap-kiosk-3 wrap-anywhere [&_h2]:text-kiosk-md [&_h2]:font-bold [&_h2]:leading-[1.3] [&_p]:text-kiosk-text-muted [&_p]:leading-[1.5]">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
        {children && (
          <div className="status-panel-actions pt-kiosk-1">{children}</div>
        )}
      </div>
    </Fade>
  );
}
