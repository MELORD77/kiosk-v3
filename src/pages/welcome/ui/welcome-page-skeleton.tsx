import { useTranslation } from 'react-i18next';
import { languages } from '@/shared/lib/i18n';
import { Skeleton } from '@/shared/ui/skeleton';
import { Loader } from '@/shared/ui/loader';

export function WelcomePageSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className="welcome-page flex-1 grid grid-cols-[1fr_1fr] gap-[clamp(var(--space-6),_3.4vw,_var(--space-16))] py-kiosk-12 px-kiosk-page-gutter [[data-orientation='portrait']_&]:grid-cols-[1fr] [[data-orientation='portrait']_&]:gap-kiosk-8 medium:py-kiosk-6 short-wide:py-kiosk-6 short-wide:gap-kiosk-6 compact:grid-cols-[1fr] compact:gap-kiosk-6 welcome-page-skeleton [&_.button]:cursor-default"
      aria-busy="true"
    >
      <Loader className="sr-only" />
      <section
        className="welcome-copy flex flex-col items-start gap-kiosk-8 [[data-orientation='portrait']_&]:grid [[data-orientation='portrait']_&]:grid-cols-[1fr_1fr] [[data-orientation='portrait']_&]:gap-kiosk-6 [[data-orientation='portrait']_&]:items-end short-wide:gap-kiosk-6 compact:gap-kiosk-4 compact:[[data-orientation='portrait']_&]:grid-cols-[1fr]"
        aria-hidden="true"
      >
        <div className="welcome-title text-kiosk-welcome-title font-extrabold tracking-[-0.035em] leading-[0.95] max-w-[7ch] [[data-orientation='portrait']_&]:text-kiosk-welcome-title compact:text-kiosk-welcome-title compact:[[data-orientation='portrait']_&]:text-kiosk-welcome-title">
          <Skeleton variant="text">{t('welcome.uz')}</Skeleton>
        </div>
        <div className="welcome-translations grid gap-kiosk-2 text-kiosk-text-muted text-kiosk-welcome-secondary font-medium [[data-orientation='portrait']_&]:text-kiosk-welcome-secondary compact:text-kiosk-md">
          {['uzc', 'ru', 'en'].map((language) => (
            <p key={language}>
              <Skeleton variant="text">{t(`welcome.${language}`)}</Skeleton>
            </p>
          ))}
        </div>
        <div className="emergency-banner mt-auto flex gap-kiosk-6 items-center py-kiosk-4 px-kiosk-8 bg-kiosk-danger-soft border-2 border-solid border-kiosk-danger-border rounded-kiosk-md w-full [[data-orientation='portrait']_&]:col-span-full medium:p-kiosk-4 medium:gap-kiosk-3">
          <strong className="emergency-number text-kiosk-emergency-number font-extrabold text-kiosk-danger leading-[1]">
            <Skeleton variant="text">102</Skeleton>
          </strong>
          <p className="emergency-copy text-kiosk-danger-text text-kiosk-emergency-copy leading-[1.3]">
            <Skeleton variant="text">{t('welcome.emergency')}</Skeleton>
          </p>
        </div>
      </section>
      <section
        className="welcome-languages flex flex-col gap-kiosk-4"
        aria-hidden="true"
      >
        <h2 className="welcome-eyebrow text-kiosk-primary text-kiosk-welcome-eyebrow uppercase font-bold tracking-[0.08em]">
          <Skeleton variant="text">{t('welcome.eyebrow')}</Skeleton>
        </h2>
        <div className="language-cards grid gap-kiosk-3 flex-none">
          {languages.map((language) => (
            <div
              key={language.code}
              className="button border border-solid items-center gap-kiosk-3 font-bold cursor-pointer leading-[1.3] no-underline [&:disabled]:cursor-not-allowed button--secondary text-kiosk-text bg-kiosk-surface border-kiosk-control-border [&:enabled:hover]:border-kiosk-control-primary [&:enabled:focus-visible]:border-kiosk-control-primary language-card rounded-kiosk-md min-h-[100px] py-kiosk-4 px-kiosk-6 flex justify-between shadow-kiosk-card text-left [[data-orientation='portrait']_&]:min-h-[112px] medium:p-kiosk-4 compact:min-h-[84px] compact:[[data-orientation='portrait']_&]:min-h-[84px]"
            >
              <span className="language-card-name text-kiosk-language-name font-bold [[data-orientation='portrait']_&]:text-kiosk-language-name compact:text-kiosk-lg compact:[[data-orientation='portrait']_&]:text-kiosk-lg">
                <Skeleton variant="text">
                  {t(`languages.${language.code}`)}
                </Skeleton>
              </span>
              <span className="language-card-details flex items-center gap-kiosk-4 medium:gap-kiosk-2">
                <span className="language-card-code text-kiosk-text-muted text-kiosk-language-code [[data-orientation='portrait']_&]:text-kiosk-language-code compact:text-kiosk-sm compact:[[data-orientation='portrait']_&]:text-kiosk-sm">
                  <Skeleton variant="text">
                    {t(`languages.${language.code}Code`)}
                  </Skeleton>
                </span>
                <Skeleton
                  variant="icon"
                  className="circle-arrow w-[clamp(48px,_3.6vw,_68px)] h-[clamp(48px,_3.6vw,_68px)] text-kiosk-control-primary grid place-items-center flex-none [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6"
                />
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
