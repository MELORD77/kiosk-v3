import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/shared/ui/skeleton';
import { Loader } from '@/shared/ui/loader';
import { PageHeadingSkeleton } from '@/shared/ui/page-heading';
import { FormFieldSkeleton } from '@/shared/ui/form-field';

export function RouteSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className="page-container py-kiosk-10 px-kiosk-page-gutter page-container--narrow w-[min(100%,_1000px)] mx-auto stack grid gap-kiosk-6 route-skeleton"
      aria-busy="true"
    >
      <Loader className="sr-only" />
      <PageHeadingSkeleton
        title={t('demo.title')}
        description={t('demo.description')}
      />
      <section className="stack grid gap-kiosk-6" aria-hidden="true">
        <h2>
          <Skeleton variant="text">{t('demo.profiles')}</Skeleton>
        </h2>
        <FormFieldSkeleton label={t('demo.scenario')} />
        <div className="demo-profiles grid grid-cols-[repeat(2,_minmax(0,_1fr))] gap-kiosk-3 compact:grid-cols-[1fr]">
          {['portrait', 'landscape'].map((id) => (
            <div
              key={id}
              className="demo-profile min-h-[96px] p-kiosk-4 rounded-kiosk-md bg-kiosk-surface border border-solid border-kiosk-border grid gap-kiosk-2 [&_h3]:text-kiosk-md"
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
      </section>
      <section className="stack grid gap-kiosk-6" aria-hidden="true">
        <h2>
          <Skeleton variant="text">{t('demo.formTitle')}</Skeleton>
        </h2>
        <div className="stack grid gap-kiosk-6">
          <FormFieldSkeleton label={t('demo.label')} hint={t('demo.hint')} />
          <div>
            <Skeleton variant="button">{t('demo.submit')}</Skeleton>
          </div>
        </div>
      </section>
    </div>
  );
}
