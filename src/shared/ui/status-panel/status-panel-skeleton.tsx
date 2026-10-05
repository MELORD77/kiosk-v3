import { Skeleton } from '@/shared/ui/skeleton';

interface StatusPanelSkeletonProps {
  title: string;
  description?: string;
  action?: string;
}

export function StatusPanelSkeleton({
  title,
  description,
  action,
}: StatusPanelSkeletonProps) {
  return (
    <div
      className="status-panel border border-solid border-kiosk-border rounded-kiosk-md p-kiosk-8 flex items-start gap-kiosk-4 bg-kiosk-surface compact:flex-wrap compact:p-kiosk-6"
      aria-hidden="true"
    >
      <Skeleton
        variant="icon"
        className="status-panel-icon flex-none grid place-items-center w-kiosk-12 h-kiosk-12 rounded-kiosk-sm bg-kiosk-surface-muted text-kiosk-primary"
      />
      <div className="status-panel-content min-w-0 grid gap-kiosk-3 wrap-anywhere [&_h2]:text-kiosk-md [&_h2]:font-bold [&_h2]:leading-[1.3] [&_p]:text-kiosk-text-muted [&_p]:leading-[1.5]">
        <h2>
          <Skeleton variant="text">{title}</Skeleton>
        </h2>
        {description && (
          <p>
            <Skeleton variant="text">{description}</Skeleton>
          </p>
        )}
        {action && (
          <div className="status-panel-actions pt-kiosk-1">
            <Skeleton variant="button">{action}</Skeleton>
          </div>
        )}
      </div>
    </div>
  );
}
