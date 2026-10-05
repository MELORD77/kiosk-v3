import { useTranslation } from 'react-i18next';
import { Loader } from '@/shared/ui/loader';
import { Skeleton } from '@/shared/ui/skeleton';

export function DemoProfileListSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className="demo-profiles grid grid-cols-[repeat(2,_minmax(0,_1fr))] gap-kiosk-3 compact:grid-cols-[1fr]"
      aria-busy="true"
    >
      <Loader className="sr-only" />
      {['portrait', 'landscape'].map((id) => (
        <div
          key={id}
          className="demo-profile min-h-[96px] p-kiosk-4 rounded-kiosk-md bg-kiosk-surface border border-solid border-kiosk-border grid gap-kiosk-2 [&_h3]:text-kiosk-md"
          aria-hidden="true"
        >
          <h3>
            <Skeleton variant="text">{t(`settings.${id}`)}</Skeleton>
          </h3>
          <p className="muted text-kiosk-text-muted">
            <Skeleton variant="text">
              {id === 'portrait' ? '1080 × 1920' : '1920 × 1080'}
            </Skeleton>
          </p>
        </div>
      ))}
    </div>
  );
}
