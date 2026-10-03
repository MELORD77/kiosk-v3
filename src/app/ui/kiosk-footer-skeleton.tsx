import { styles } from './styles';
import { cn } from '@/shared/lib/classnames';
import { buttonStyles } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { languages } from '@/shared/lib/i18n';
import { Skeleton } from '@/shared/ui/skeleton';
import { Loader } from '@/shared/ui/loader';

export function KioskFooterSkeleton() {
  const { t } = useTranslation();
  return (
    <footer
      className={cn(styles['kiosk-footer'], styles['kiosk-footer-skeleton'])}
      aria-busy="true"
    >
      <Loader className={'sr-only'} />
      <div className={styles['footer-languages']} aria-hidden="true">
        {languages.map((language) => (
          <Skeleton
            key={language.code}
            variant="button"
            className={buttonStyles['button']}
          >
            {language.shortLabel}
          </Skeleton>
        ))}
      </div>
      <div className={styles['footer-emergency']} aria-hidden="true">
        <strong>
          <Skeleton variant="text">102</Skeleton>
        </strong>
        <span>
          <Skeleton variant="text">{t('footer.emergency')}</Skeleton>
        </span>
      </div>
      <div
        className={cn(
          buttonStyles['button'],
          buttonStyles['button--secondary'],
          styles['footer-finish'],
        )}
        aria-hidden="true"
      >
        <Skeleton variant="icon" />
        <Skeleton variant="text">{t('common.finish')}</Skeleton>
      </div>
    </footer>
  );
}
