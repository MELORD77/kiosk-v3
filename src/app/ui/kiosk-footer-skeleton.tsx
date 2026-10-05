import { useTranslation } from 'react-i18next';
import { languages } from '@/shared/lib/i18n';
import { Skeleton } from '@/shared/ui/skeleton';
import { Loader } from '@/shared/ui/loader';

export function KioskFooterSkeleton() {
  const { t } = useTranslation();
  return (
    <footer
      className="kiosk-footer flex-none h-auto min-h-kiosk-footer-height flex justify-between items-center gap-kiosk-4 flex-wrap py-kiosk-2 px-kiosk-page-gutter border-t border-solid border-t-kiosk-border bg-kiosk-shell-surface [[data-orientation='portrait']_&]:h-auto [[data-orientation='portrait']_&]:flex-wrap [[data-orientation='portrait']_&]:gap-kiosk-4 [[data-orientation='portrait']_&]:py-kiosk-4 footer-wrap:h-auto footer-wrap:flex-wrap footer-wrap:gap-kiosk-4 footer-wrap:py-kiosk-4 compact:gap-kiosk-3 compact:py-kiosk-3 compact:[[data-orientation='portrait']_&]:gap-kiosk-3 compact:[[data-orientation='portrait']_&]:py-kiosk-3 kiosk-footer-skeleton [&_.button]:cursor-default"
      aria-busy="true"
    >
      <Loader className="sr-only" />
      <div
        className="footer-languages flex items-center flex-none max-w-full flex-wrap gap-kiosk-footer-language-gap [&_.button]:w-kiosk-footer-language-width [&_.button]:min-h-kiosk-footer-control-height [&_.button]:h-auto [&_.button]:py-kiosk-2 [&_.button]:px-0 [&_.button]:rounded-kiosk-footer-language-radius [&_.button]:text-kiosk-footer-text-size [&_.button]:font-bold [&_.button]:bg-kiosk-surface [&_.button]:border-kiosk-control-border [&_.button:enabled:hover]:border-kiosk-control-primary [&_.button[aria-pressed='true']]:text-kiosk-on-primary [&_.button[aria-pressed='true']]:bg-kiosk-control-primary [&_.button[aria-pressed='true']]:border-kiosk-control-primary-border [&_.button[aria-pressed='true']:enabled:hover]:bg-none [&_.button[aria-pressed='true']:enabled:hover]:bg-kiosk-control-primary-hover compact:[&_.button]:text-kiosk-sm compact:[&_.button]:w-[max(48px,_3rem)] compact:[&_.button]:h-auto compact:[&_.button]:min-h-[max(48px,_3rem)] compact:[&_.button]:rounded-kiosk-sm compact:gap-kiosk-1"
        aria-hidden="true"
      >
        {languages.map((language) => (
          <Skeleton
            key={language.code}
            variant="button"
            className="button border border-solid border-[transparent] rounded-kiosk-sm min-h-[56px] py-kiosk-3 px-kiosk-6 inline-flex items-center justify-center gap-kiosk-3 font-bold cursor-pointer leading-[1.3] no-underline [&:disabled]:cursor-not-allowed"
          >
            {language.shortLabel}
          </Skeleton>
        ))}
      </div>
      <div
        className="footer-emergency flex items-center min-w-0 h-auto min-h-kiosk-footer-control-height max-w-full py-kiosk-2 px-kiosk-footer-capsule-padding border-2 border-solid border-kiosk-danger-border rounded-kiosk-footer-pill-radius gap-kiosk-footer-capsule-gap bg-kiosk-danger-soft text-kiosk-danger-text text-kiosk-md leading-[1.3] [&_strong]:text-kiosk-danger [&_strong]:text-kiosk-footer-number-size [&_strong]:font-extrabold [&_strong]:tabular-nums [&_strong]:leading-[1] [&_strong]:flex-none [&_span]:min-w-0 [&_span]:wrap-anywhere [[data-orientation='portrait']_&]:basis-[100%] [[data-orientation='portrait']_&]:order-[1] [[data-orientation='portrait']_&]:justify-center footer-wrap:basis-[100%] footer-wrap:order-[1] footer-wrap:justify-center compact:h-auto compact:min-h-kiosk-footer-control-height compact:py-kiosk-3 compact:px-kiosk-4 compact:gap-kiosk-3 compact:text-kiosk-sm compact:[&_strong]:text-kiosk-footer-number-size"
        aria-hidden="true"
      >
        <strong>
          <Skeleton variant="text">102</Skeleton>
        </strong>
        <span>
          <Skeleton variant="text">{t('footer.emergency')}</Skeleton>
        </span>
      </div>
      <div
        className="button border border-solid py-kiosk-3 px-kiosk-6 inline-flex items-center justify-center cursor-pointer leading-[1.3] no-underline [&:disabled]:cursor-not-allowed button--secondary text-kiosk-text bg-kiosk-surface border-kiosk-control-border [&:enabled:hover]:border-kiosk-control-primary [&:enabled:focus-visible]:border-kiosk-control-primary footer-finish flex-none min-h-kiosk-footer-control-height h-auto max-w-full pt-kiosk-2 pr-kiosk-6 pb-kiosk-2 pl-kiosk-4 rounded-kiosk-footer-pill-radius gap-kiosk-3 text-kiosk-footer-text-size font-semibold [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6 [&_svg]:flex-none compact:min-w-0 compact:max-w-full compact:h-auto compact:min-h-[max(48px,_3rem)] compact:px-kiosk-3 compact:gap-kiosk-2 compact:text-kiosk-sm compact:[&_svg]:w-kiosk-6 compact:[&_svg]:h-kiosk-6"
        aria-hidden="true"
      >
        <Skeleton variant="icon" />
        <Skeleton variant="text">{t('common.finish')}</Skeleton>
      </div>
    </footer>
  );
}
