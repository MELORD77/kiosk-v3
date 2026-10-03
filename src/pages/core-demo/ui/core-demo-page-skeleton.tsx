import { layoutStyles } from '@/shared/lib/ui-styles';
import { cn } from '@/shared/lib/classnames';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/shared/ui/skeleton';
import { PageHeadingSkeleton } from '@/shared/ui/page-heading';
import { FormFieldSkeleton } from '@/shared/ui/form-field';
import { Loader } from '@/shared/ui/loader';

export function CoreDemoPageSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        layoutStyles['page-container'],
        layoutStyles['page-container--narrow'],
        layoutStyles['stack'],
        'core-demo-page-skeleton',
      )}
      aria-busy="true"
    >
      <Loader className={'sr-only'} />
      <PageHeadingSkeleton
        title={t('demo.title')}
        description={t('demo.description')}
      />
      <section className={layoutStyles['stack']} aria-hidden="true">
        <h2>
          <Skeleton variant="text">{t('demo.profiles')}</Skeleton>
        </h2>
        <FormFieldSkeleton label={t('demo.scenario')} />
        <div className={styles['demo-profiles']}>
          {['portrait', 'landscape'].map((id) => (
            <div key={id} className={styles['demo-profile']}>
              <h3>
                <Skeleton variant="text">{t(`settings.${id}`)}</Skeleton>
              </h3>
              <p className={layoutStyles['muted']}>
                <Skeleton variant="text">
                  {id === 'portrait' ? '1080 × 1920' : '1920 × 1080'}
                </Skeleton>
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className={layoutStyles['stack']} aria-hidden="true">
        <h2>
          <Skeleton variant="text">{t('demo.formTitle')}</Skeleton>
        </h2>
        <div className={layoutStyles['stack']}>
          <FormFieldSkeleton label={t('demo.label')} hint={t('demo.hint')} />
          <div>
            <Skeleton variant="button">{t('demo.submit')}</Skeleton>
          </div>
        </div>
      </section>
    </div>
  );
}
