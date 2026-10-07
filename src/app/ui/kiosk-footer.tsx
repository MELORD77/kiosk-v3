import { useTranslation } from 'react-i18next';
import { languages } from '@/shared/lib/i18n';
import { Button } from '@/shared/ui/button';
import { CloseIcon } from '@/shared/ui/close-icon';
import { BackButton } from '@/shared/ui/back-button';
import { useBackNavigation } from '@/shared/lib/back-navigation';

interface KioskFooterProps {
  onEndSession: () => void;
  onCallOperator: (opener: HTMLButtonElement) => void;
}

export function KioskFooter({
  onEndSession,
  onCallOperator,
}: KioskFooterProps) {
  const { t, i18n } = useTranslation();
  const navigation = useBackNavigation();
  return (
    <footer className="kiosk-footer flex-none h-auto min-h-kiosk-footer-height flex justify-between items-center gap-kiosk-4 flex-wrap py-kiosk-2 px-kiosk-page-gutter border-t border-solid border-t-kiosk-border bg-kiosk-shell-surface [[data-orientation='portrait']_&]:h-auto [[data-orientation='portrait']_&]:flex-wrap [[data-orientation='portrait']_&]:gap-kiosk-4 [[data-orientation='portrait']_&]:py-kiosk-4 footer-wrap:h-auto footer-wrap:flex-wrap footer-wrap:gap-kiosk-4 footer-wrap:py-kiosk-4 compact:gap-kiosk-3 compact:py-kiosk-3 compact:[[data-orientation='portrait']_&]:gap-kiosk-3 compact:[[data-orientation='portrait']_&]:py-kiosk-3 short:gap-kiosk-2 short:py-kiosk-2 short-wide:gap-kiosk-2 short-wide:py-kiosk-2 short:[[data-orientation='portrait']_&]:gap-kiosk-2 short:[[data-orientation='portrait']_&]:py-kiosk-2">
      {navigation?.enabled ? (
        <BackButton
          placement="footer"
          onClick={navigation.action.onBack}
          disabled={navigation.action.disabled}
          className="footer-back flex-none min-h-kiosk-footer-control-height py-kiosk-2 px-kiosk-6 rounded-kiosk-footer-language-radius text-kiosk-footer-text-size short-wide:min-h-kiosk-12 short-wide:text-kiosk-sm compact:text-kiosk-sm compact:min-h-[max(48px,_3rem)]"
        />
      ) : (
        <div
          className="footer-languages flex items-center flex-none max-w-full flex-wrap gap-kiosk-footer-language-gap [&_.button]:w-kiosk-footer-language-width [&_.button]:min-h-kiosk-footer-control-height [&_.button]:h-auto [&_.button]:py-kiosk-2 [&_.button]:px-0 [&_.button]:rounded-kiosk-footer-language-radius [&_.button]:text-kiosk-footer-text-size [&_.button]:font-bold short-wide:[&_.button]:w-kiosk-12 short-wide:[&_.button]:min-h-kiosk-12 short-wide:[&_.button]:text-kiosk-sm compact:[&_.button]:text-kiosk-sm compact:[&_.button]:w-[max(48px,_3rem)] compact:[&_.button]:h-auto compact:[&_.button]:min-h-[max(48px,_3rem)] compact:[&_.button]:rounded-kiosk-sm compact:gap-kiosk-1"
          role="group"
          aria-label={t('common.language')}
        >
          {languages.map((language) => (
            <Button
              key={language.code}
              variant={
                i18n.language === language.code ? 'primary' : 'secondary'
              }
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
      )}
      <Button
        variant="danger"
        onClick={(event) => onCallOperator(event.currentTarget)}
        className="footer-emergency flex items-center justify-start text-left font-normal min-w-0 h-auto min-h-kiosk-footer-control-height max-w-lg py-kiosk-2 px-kiosk-footer-capsule-padding border-2 border-solid border-kiosk-danger-border rounded-kiosk-footer-pill-radius gap-kiosk-footer-capsule-gap bg-kiosk-danger-soft text-kiosk-danger-text text-kiosk-md leading-[1.3] [&_strong]:text-kiosk-danger [&_strong]:text-kiosk-footer-number-size [&_strong]:font-extrabold [&_strong]:tabular-nums [&_strong]:leading-[1] [&_strong]:flex-none [&_span]:min-w-0 [&_span]:wrap-anywhere [[data-orientation='portrait']_&]:basis-[100%] [[data-orientation='portrait']_&]:order-[1] [[data-orientation='portrait']_&]:justify-center footer-wrap:basis-[100%] footer-wrap:order-[1] footer-wrap:justify-center compact:h-auto compact:min-h-kiosk-footer-control-height compact:py-kiosk-3 compact:px-kiosk-4 compact:gap-kiosk-3 compact:text-kiosk-sm compact:[&_strong]:text-kiosk-footer-number-size short-wide:basis-0 short-wide:order-none short-wide:flex-1 short-wide:justify-center short-wide:px-kiosk-3 short-wide:gap-kiosk-2 short-wide:text-kiosk-sm short-wide:[&_strong]:text-kiosk-lg short-wide:min-h-kiosk-12 compact:py-kiosk-2"
      >
        <strong>102</strong>
        <span>{t('footer.emergency')}</span>
      </Button>
      <Button
        variant="primary"
        className="footer-finish flex-none min-h-kiosk-footer-control-height h-auto max-w-full pt-kiosk-2 pr-kiosk-6 pb-kiosk-2 pl-kiosk-4 rounded-kiosk-footer-pill-radius gap-kiosk-3 text-kiosk-footer-text-size font-semibold [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6 [&_svg]:flex-none compact:min-w-0 compact:max-w-full compact:h-auto compact:min-h-[max(48px,_3rem)] compact:px-kiosk-3 compact:gap-kiosk-2 compact:text-kiosk-sm compact:[&_svg]:w-kiosk-6 compact:[&_svg]:h-kiosk-6 short-wide:text-kiosk-sm short-wide:px-kiosk-3 short-wide:min-h-kiosk-12"
        onClick={onEndSession}
      >
        <CloseIcon />
        {t('common.finish')}
      </Button>
    </footer>
  );
}
