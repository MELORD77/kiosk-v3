import { styles } from './styles';
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
      : styles[`status-panel--${tone}`];
  return (
    <Fade
      kind="feedback"
      className={cn(styles['status-panel'], toneClass)}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <div className={styles['status-panel-icon']}>
        <StatusIcon kind={iconKind} />
      </div>
      <div className={styles['status-panel-content']}>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
        {children && (
          <div className={styles['status-panel-actions']}>{children}</div>
        )}
      </div>
    </Fade>
  );
}
