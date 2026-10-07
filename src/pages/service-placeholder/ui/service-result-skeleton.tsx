import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/classnames';

interface ServiceResultSkeletonProps {
  serviceNumber: number;
}

export function ServiceResultSkeleton({
  serviceNumber,
}: ServiceResultSkeletonProps) {
  if (serviceNumber === 12 || serviceNumber === 22) {
    return (
      <div
        aria-hidden="true"
        className="flex items-center gap-kiosk-4 border border-kiosk-border bg-kiosk-surface rounded-kiosk-md p-kiosk-8"
      >
        <Skeleton className="w-kiosk-12 h-kiosk-12 shrink-0" />
        <Skeleton variant="text" className="w-1/2 h-kiosk-6" />
      </div>
    );
  }
  if (serviceNumber === 8) {
    return (
      <div aria-hidden="true" className="grid gap-kiosk-3">
        <div className="grid gap-kiosk-3 border border-kiosk-control-border bg-kiosk-surface rounded-kiosk-md p-kiosk-4">
          <Skeleton variant="text" className="w-1/4 h-kiosk-6" />
          <Skeleton variant="text" className="w-full h-kiosk-12" />
        </div>
        <div className="grid gap-kiosk-3 border border-kiosk-control-border bg-kiosk-surface rounded-kiosk-md p-kiosk-4">
          <Skeleton variant="text" className="w-1/3 h-kiosk-6" />
          {[0, 1, 2, 3, 4].map((row) => (
            <Skeleton key={row} className="w-full h-kiosk-12" />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-2 gap-kiosk-3 [[data-orientation='portrait']_&]:grid-cols-1 compact:grid-cols-1"
    >
      {[0, 1, 2].map((section) => (
        <div
          key={section}
          className={cn(
            'grid gap-kiosk-3 border border-kiosk-control-border bg-kiosk-surface rounded-kiosk-md p-kiosk-4',
            section === 2 && 'col-span-full',
          )}
        >
          <Skeleton variant="text" className="w-1/2 h-kiosk-6" />
          <div
            className={cn(
              'grid gap-kiosk-3 compact:grid-cols-1',
              section === 2 ? 'grid-cols-4 medium:grid-cols-2' : 'grid-cols-2',
            )}
          >
            {[0, 1, 2, 3].map((field) => (
              <div key={field} className="grid gap-kiosk-1">
                <Skeleton variant="text" className="w-1/2 h-kiosk-4" />
                <Skeleton variant="text" className="w-full h-kiosk-6" />
              </div>
            ))}
          </div>
        </div>
      ))}
      <Skeleton className="col-span-full h-kiosk-16" />
    </div>
  );
}
