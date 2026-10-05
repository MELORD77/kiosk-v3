import { cn } from '@/shared/lib/classnames';
import type { ReactNode } from 'react';

interface SkeletonProps {
  variant?: 'text' | 'icon' | 'badge' | 'button' | 'input' | 'box';
  children?: ReactNode;
  className?: string;
}

export function Skeleton({
  variant = 'box',
  children,
  className,
}: SkeletonProps) {
  return (
    <span
      className={cn(
        variant === 'button' &&
          'button border border-solid border-[transparent] rounded-kiosk-sm min-h-[56px] py-kiosk-3 px-kiosk-6 inline-flex items-center justify-center gap-kiosk-3 font-bold cursor-pointer leading-[1.3] no-underline [&:disabled]:cursor-not-allowed',
        variant === 'input' &&
          "text-field w-full min-h-[56px] bg-kiosk-surface border-2 border-solid border-kiosk-border-strong rounded-kiosk-sm text-kiosk-text py-kiosk-3 px-kiosk-4 [&[aria-invalid='true']]:border-kiosk-danger",
        variant === 'badge' &&
          'badge inline-flex items-center justify-center rounded-kiosk-sm py-kiosk-1 px-kiosk-3 tabular-nums',
        'skeleton block bg-kiosk-surface-muted rounded-kiosk-sm animate-kiosk-skeleton pointer-events-none select-none [&.status-panel-icon]:rounded-kiosk-sm [&.service-card-arrow]:bg-kiosk-surface-muted [&.circle-arrow]:bg-kiosk-surface-muted [&.service-card-arrow]:rounded-kiosk-sm [&.circle-arrow]:rounded-kiosk-sm',
        variant === 'badge' && 'skeleton--badge inline-flex',
        variant === 'box' && 'skeleton--box h-kiosk-6 w-full',
        variant === 'button' && 'skeleton--button inline-flex cursor-default',
        variant === 'icon' &&
          'skeleton--icon [:where(&)]:w-kiosk-6 [:where(&)]:h-kiosk-6 [:where(&)]:flex-none rounded-[50%]',
        variant === 'input' &&
          'skeleton--input overflow-hidden whitespace-nowrap',
        variant === 'text' &&
          'skeleton--text inline rounded-kiosk-sm [box-decoration-break:clone] [-webkit-box-decoration-break:clone]',
        className,
      )}
      aria-hidden="true"
    >
      {children !== undefined && (
        <span className="skeleton-measure invisible">{children}</span>
      )}
    </span>
  );
}
