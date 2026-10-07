import { useId } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/classnames';
import { Badge } from '@/shared/ui/badge';
import { ServiceFlowIcon } from './service-flow-icon';
import type { ServiceFlowIconName } from './service-flow-icon';

type ResultSectionTone = 'primary' | 'success' | 'warning';

const cornerStyles: Record<ResultSectionTone, string> = {
  primary:
    'bg-kiosk-primary-soft text-kiosk-primary border-kiosk-control-primary-border',
  success:
    'bg-kiosk-success-soft text-kiosk-success border-kiosk-success-border',
  warning:
    'bg-kiosk-warning-soft text-kiosk-warning-text border-kiosk-warning-border',
};

interface ResultSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  count?: number;
  icon?: ServiceFlowIconName;
  tone?: ResultSectionTone;
}

export function ResultSection({
  title,
  children,
  className,
  count,
  icon = 'document',
  tone = 'primary',
}: ResultSectionProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        'relative isolate min-w-0 overflow-hidden grid content-start gap-kiosk-4 border border-kiosk-border bg-kiosk-surface rounded-kiosk-lg shadow-kiosk-card p-kiosk-6 compact:p-kiosk-4',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute -z-10 top-kiosk-6 right-kiosk-6 grid place-items-center w-12 h-12 rounded-kiosk-sm border compact:top-kiosk-4 compact:right-kiosk-4',
          cornerStyles[tone],
        )}
      >
        <span className="w-7 h-7 [&_svg]:w-full [&_svg]:h-full">
          <ServiceFlowIcon name={icon} />
        </span>
      </div>
      <h3
        id={headingId}
        className="relative flex min-h-12 items-center gap-kiosk-3 pe-16 text-kiosk-lg text-kiosk-text font-extrabold wrap-anywhere"
      >
        <span className="min-w-0">{title}</span>
        {count !== undefined && (
          <Badge tone="primary" className="text-kiosk-description shrink-0">
            {count}
          </Badge>
        )}
      </h3>
      {children}
    </section>
  );
}
