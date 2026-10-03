import { styles } from './styles';
import { cn } from '@/shared/lib/classnames';
import { buttonStyles } from '@/shared/ui/button';
import { skeletonStyles } from '@/shared/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/shared/ui/skeleton';
import { FormFieldSkeleton } from '@/shared/ui/form-field';

interface IdentityFormSkeletonProps {
  serviceName?: string;
}

export function IdentityFormSkeleton({
  serviceName,
}: IdentityFormSkeletonProps) {
  const { t } = useTranslation();
  const keys = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    t('identity.clear'),
    '0',
    null,
  ];
  return (
    <div
      className={cn(styles['identity-form'], styles['identity-form-skeleton'])}
      aria-hidden="true"
    >
      <div className={styles['identity-copy']}>
        <div className={styles['identity-navigation']}>
          <div className={cn(buttonStyles['button'], styles['identity-back'])}>
            <Skeleton variant="icon" />
            <Skeleton variant="text">{t('common.back')}</Skeleton>
          </div>
          <span className={styles['identity-step']}>
            <Skeleton variant="text">{t('identity.stepCount')}</Skeleton>
          </span>
        </div>
        <div className={styles['identity-progress']}>
          <Skeleton variant="box" />
          <Skeleton variant="box" />
        </div>
        <div className={styles['identity-service-name']}>
          <Skeleton variant="text">
            {serviceName ?? t('services.service-1')}
          </Skeleton>
        </div>
        <div className={styles['identity-intro']}>
          <h2>
            <Skeleton variant="text">{t('identity.pinTitle')}</Skeleton>
          </h2>
          <p>
            <Skeleton variant="text">{t('identity.pinHint')}</Skeleton>
          </p>
        </div>
        <div className={styles['identity-methods']}>
          <Skeleton variant="button" className={buttonStyles['button']}>
            {t('identity.pinMethod')}
          </Skeleton>
          <Skeleton variant="button" className={buttonStyles['button']}>
            {t('identity.passportMethod')}
          </Skeleton>
        </div>
      </div>
      <div className={styles['identity-entry']}>
        <FormFieldSkeleton
          label={t('identity.pinLabel')}
          inputClassName={styles['identity-input']}
          placeholder={t('identity.pinPlaceholder')}
        />
        <div className={styles['identity-keypad']}>
          {keys.map((key, index) => (
            <Skeleton
              key={index}
              variant="button"
              className={
                index === 9 || index === 11
                  ? cn(
                      buttonStyles['button'],
                      styles['identity-key'],
                      styles['identity-key--action'],
                    )
                  : cn(buttonStyles['button'], styles['identity-key'])
              }
            >
              {key}
            </Skeleton>
          ))}
        </div>
      </div>
      <div
        className={cn(
          buttonStyles['button'],
          styles['identity-continue'],
          skeletonStyles['skeleton'],
          skeletonStyles['skeleton--button'],
        )}
      >
        <Skeleton variant="text">{t('identity.continue')}</Skeleton>
        <Skeleton variant="icon" />
      </div>
    </div>
  );
}
