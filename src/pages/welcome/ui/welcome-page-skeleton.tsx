import { styles } from './styles';
import { cn } from '@/shared/lib/classnames';
import { buttonStyles } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { languages } from '@/shared/lib/i18n';
import { Skeleton } from '@/shared/ui/skeleton';
import { Loader } from '@/shared/ui/loader';

export function WelcomePageSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className={cn(styles['welcome-page'], styles['welcome-page-skeleton'])}
      aria-busy="true"
    >
      <Loader className={'sr-only'} />
      <section className={styles['welcome-copy']} aria-hidden="true">
        <div className={styles['welcome-title']}>
          <Skeleton variant="text">{t('welcome.uz')}</Skeleton>
        </div>
        <div className={styles['welcome-translations']}>
          {['uzc', 'ru', 'en'].map((language) => (
            <p key={language}>
              <Skeleton variant="text">{t(`welcome.${language}`)}</Skeleton>
            </p>
          ))}
        </div>
        <div className={styles['emergency-banner']}>
          <strong className={styles['emergency-number']}>
            <Skeleton variant="text">102</Skeleton>
          </strong>
          <p className={styles['emergency-copy']}>
            <Skeleton variant="text">{t('welcome.emergency')}</Skeleton>
          </p>
        </div>
      </section>
      <section className={styles['welcome-languages']} aria-hidden="true">
        <h2 className={styles['welcome-eyebrow']}>
          <Skeleton variant="text">{t('welcome.eyebrow')}</Skeleton>
        </h2>
        <div className={styles['language-cards']}>
          {languages.map((language) => (
            <div
              key={language.code}
              className={cn(
                buttonStyles['button'],
                buttonStyles['button--secondary'],
                styles['language-card'],
              )}
            >
              <span className={styles['language-card-name']}>
                <Skeleton variant="text">
                  {t(`languages.${language.code}`)}
                </Skeleton>
              </span>
              <span className={styles['language-card-details']}>
                <span className={styles['language-card-code']}>
                  <Skeleton variant="text">
                    {t(`languages.${language.code}Code`)}
                  </Skeleton>
                </span>
                <Skeleton variant="icon" className={styles['circle-arrow']} />
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
