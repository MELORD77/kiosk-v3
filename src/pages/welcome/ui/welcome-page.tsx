import { styles } from './styles';
import { cn } from '@/shared/lib/classnames';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { useKioskSessionStore } from '@/features/kiosk-session';
import { languages, type Language } from '@/shared/lib/i18n';
import { Button } from '@/shared/ui/button';
import { ArrowIcon } from '@/shared/ui/arrow-icon';
import { isSkeletonPreview } from '@/shared/lib/skeleton-preview';
import { WelcomePageSkeleton } from './welcome-page-skeleton';
import { WelcomeBackdrop } from './welcome-backdrop';

export function WelcomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { search } = useLocation();
  const startSession = useKioskSessionStore((state) => state.startSession);

  async function chooseLanguage(language: Language) {
    await i18n.changeLanguage(language);
    startSession();
    void navigate('/home');
  }

  if (isSkeletonPreview(search)) return <WelcomePageSkeleton />;

  return (
    <div className={styles['welcome-page']}>
      <section
        className={cn(styles['welcome-copy'], 'relative', 'isolate')}
        aria-labelledby="welcome-title"
      >
        <WelcomeBackdrop />
        <h1
          id="welcome-title"
          className={cn(
            styles['welcome-title'],
            'relative',
            'z-10',
            'motion-safe:animate-welcome-reveal',
          )}
          lang="uz-Latn"
        >
          {t('welcome.uz')}
        </h1>
        <div className={cn(styles['welcome-translations'], 'relative', 'z-10')}>
          <p
            className={cn(
              'motion-safe:animate-welcome-reveal',
              'motion-safe:[animation-delay:100ms]',
            )}
            lang="uz-Cyrl"
          >
            {t('welcome.uzc')}
          </p>
          <p
            className={cn(
              'motion-safe:animate-welcome-reveal',
              'motion-safe:[animation-delay:200ms]',
            )}
            lang="ru"
          >
            {t('welcome.ru')}
          </p>
          <p
            className={cn(
              'motion-safe:animate-welcome-reveal',
              'motion-safe:[animation-delay:300ms]',
            )}
            lang="en"
          >
            {t('welcome.en')}
          </p>
        </div>
        <div className={cn(styles['emergency-banner'], 'relative', 'z-10')}>
          <strong className={styles['emergency-number']}>102</strong>
          <p className={styles['emergency-copy']}>{t('welcome.emergency')}</p>
        </div>
      </section>
      <section
        className={styles['welcome-languages']}
        aria-labelledby="language-heading"
      >
        <h2 id="language-heading" className={styles['welcome-eyebrow']}>
          {t('welcome.eyebrow')}
        </h2>
        <div className={styles['language-cards']}>
          {languages.map((language) => (
            <Button
              key={language.code}
              variant="secondary"
              className={styles['language-card']}
              onClick={() => {
                void chooseLanguage(language.code);
              }}
            >
              <span
                className={styles['language-card-name']}
                lang={language.htmlLang}
              >
                {t(`languages.${language.code}`)}
              </span>
              <span
                className={styles['language-card-details']}
                aria-hidden="true"
              >
                <span className={styles['language-card-code']}>
                  {t(`languages.${language.code}Code`)}
                </span>
                <span className={styles['circle-arrow']}>
                  <ArrowIcon />
                </span>
              </span>
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}
