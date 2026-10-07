import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { useKioskSessionStore } from '@/features/kiosk-session';
import { languages, type Language } from '@/shared/lib/i18n';
import { Button } from '@/shared/ui/button';
import { ArrowIcon } from '@/shared/ui/arrow-icon';
import { isSkeletonPreview } from '@/shared/lib/skeleton-preview';
import { WelcomePageSkeleton } from './welcome-page-skeleton';

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
    <div className="welcome-page flex-1 grid grid-cols-[1fr_1fr] gap-[clamp(var(--space-6),_3.4vw,_var(--space-16))] py-kiosk-12 px-kiosk-page-gutter [[data-orientation='portrait']_&]:grid-cols-[1fr] [[data-orientation='portrait']_&]:gap-kiosk-8 medium:py-kiosk-6 short-wide:py-kiosk-6 short-wide:gap-kiosk-6 compact:grid-cols-[1fr] compact:gap-kiosk-4 short:py-kiosk-4 short:gap-kiosk-4">
      <section
        className="welcome-copy flex flex-col items-start gap-kiosk-8 [[data-orientation='portrait']_&]:grid [[data-orientation='portrait']_&]:grid-cols-[1fr_1fr] [[data-orientation='portrait']_&]:gap-kiosk-6 [[data-orientation='portrait']_&]:items-end short-wide:gap-kiosk-6 compact:gap-kiosk-3 compact:[[data-orientation='portrait']_&]:grid-cols-[1fr] relative isolate"
        aria-labelledby="welcome-title"
      >
        <h1
          id="welcome-title"
          className="welcome-title text-kiosk-welcome-title font-extrabold tracking-[-0.035em] leading-[0.95] max-w-[7ch] [[data-orientation='portrait']_&]:text-kiosk-welcome-title compact:text-[clamp(2rem,5dvh,3.5rem)] compact:[[data-orientation='portrait']_&]:text-[clamp(2rem,5dvh,3.5rem)] relative z-10 motion-safe:animate-welcome-reveal"
          lang="uz-Latn"
        >
          {t('welcome.uz')}
        </h1>
        <div className="welcome-translations grid gap-kiosk-2 text-kiosk-text-muted text-kiosk-welcome-secondary font-medium [[data-orientation='portrait']_&]:text-kiosk-welcome-secondary compact:text-kiosk-md relative z-10">
          <p
            className="motion-safe:animate-welcome-reveal motion-safe:[animation-delay:100ms]"
            lang="uz-Cyrl"
          >
            {t('welcome.uzc')}
          </p>
          <p
            className="motion-safe:animate-welcome-reveal motion-safe:[animation-delay:200ms]"
            lang="ru"
          >
            {t('welcome.ru')}
          </p>
          <p
            className="motion-safe:animate-welcome-reveal motion-safe:[animation-delay:300ms]"
            lang="en"
          >
            {t('welcome.en')}
          </p>
        </div>
        <div className="emergency-banner mt-auto flex gap-kiosk-6 items-center py-kiosk-4 px-kiosk-8 bg-kiosk-danger-soft border-2 border-solid border-kiosk-danger-border rounded-kiosk-md w-full [[data-orientation='portrait']_&]:col-span-full medium:p-kiosk-4 medium:gap-kiosk-3 compact:py-kiosk-2 relative z-10">
          <strong className="emergency-number text-kiosk-emergency-number font-extrabold text-kiosk-danger leading-[1]">
            102
          </strong>
          <p className="emergency-copy text-kiosk-danger-text text-kiosk-emergency-copy leading-[1.3]">
            {t('welcome.emergency')}
          </p>
        </div>
      </section>
      <section
        className="welcome-languages flex flex-col gap-kiosk-4"
        aria-labelledby="language-heading"
      >
        <h2
          id="language-heading"
          className="welcome-eyebrow text-kiosk-primary text-kiosk-welcome-eyebrow uppercase font-bold tracking-[0.08em]"
        >
          {t('welcome.eyebrow')}
        </h2>
        <div className="language-cards grid gap-kiosk-3 flex-none compact:gap-kiosk-2">
          {languages.map((language) => (
            <Button
              key={language.code}
              variant="secondary"
              className="language-card rounded-kiosk-md min-h-[clamp(56px,10dvh,112px)] py-kiosk-4 px-kiosk-6 flex justify-between shadow-kiosk-card text-left [[data-orientation='portrait']_&]:min-h-[clamp(56px,10dvh,112px)] medium:p-kiosk-4 compact:min-h-[clamp(56px,7dvh,84px)] compact:[[data-orientation='portrait']_&]:min-h-[clamp(56px,7dvh,84px)] compact:py-kiosk-2"
              onClick={() => {
                void chooseLanguage(language.code);
              }}
            >
              <span
                className="language-card-name text-kiosk-language-name font-bold [[data-orientation='portrait']_&]:text-kiosk-language-name compact:text-kiosk-lg compact:[[data-orientation='portrait']_&]:text-kiosk-lg"
                lang={language.htmlLang}
              >
                {t(`languages.${language.code}`)}
              </span>
              <span
                className="language-card-details flex items-center gap-kiosk-4 medium:gap-kiosk-2"
                aria-hidden="true"
              >
                <span className="language-card-code text-kiosk-text-muted text-kiosk-language-code [[data-orientation='portrait']_&]:text-kiosk-language-code compact:text-kiosk-sm compact:[[data-orientation='portrait']_&]:text-kiosk-sm">
                  {t(`languages.${language.code}Code`)}
                </span>
                <span className="circle-arrow w-[clamp(48px,_3.6vw,_68px)] h-[clamp(48px,_3.6vw,_68px)] text-kiosk-control-primary grid place-items-center flex-none [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6">
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
