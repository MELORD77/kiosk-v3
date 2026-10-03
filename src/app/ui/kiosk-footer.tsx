import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { languages } from '@/shared/lib/i18n';
import { Button } from '@/shared/ui/button';
import { CloseIcon } from '@/shared/ui/close-icon';

interface KioskFooterProps {
  onEndSession: () => void;
}

export function KioskFooter({ onEndSession }: KioskFooterProps) {
  const { t, i18n } = useTranslation();
  return (
    <footer className={styles['kiosk-footer']}>
      <div
        className={styles['footer-languages']}
        role="group"
        aria-label={t('common.language')}
      >
        {languages.map((language) => (
          <Button
            key={language.code}
            variant="ghost"
            aria-label={t(`languages.${language.code}`)}
            aria-pressed={i18n.language === language.code}
            lang={language.htmlLang}
            onClick={() => {
              void i18n.changeLanguage(language.code);
            }}
          >
            {language.shortLabel}
          </Button>
        ))}
      </div>
      <div className={styles['footer-emergency']}>
        <strong>102</strong>
        <span>{t('footer.emergency')}</span>
      </div>
      <Button
        variant="secondary"
        className={styles['footer-finish']}
        onClick={onEndSession}
      >
        <CloseIcon />
        {t('common.finish')}
      </Button>
    </footer>
  );
}
