import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/shared/ui/skeleton';
import { BackButtonSkeleton } from '@/shared/ui/back-button';
import { FormFieldSkeleton } from '@/shared/ui/form-field';
import { IdentityDocumentGuide } from './identity-document-guide';

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
      className="identity-form min-h-0 grid grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)] gap-x-kiosk-8 gap-y-kiosk-4 items-start w-full mx-auto [[data-orientation='portrait']_&]:flex [[data-orientation='portrait']_&]:flex-col [[data-orientation='portrait']_&]:items-stretch [[data-orientation='portrait']_&]:gap-kiosk-6 compact:flex compact:flex-col compact:items-stretch compact:gap-kiosk-4 identity-form-skeleton [&_.button]:cursor-default"
      aria-hidden="true"
    >
      <div className="identity-copy min-h-0 self-stretch min-w-0 flex flex-col gap-kiosk-4 col-start-1 row-start-1 [[data-orientation='portrait']_&]:contents short:gap-kiosk-4 compact:contents">
        <div className="identity-navigation flex flex-wrap compact:flex-nowrap items-center justify-between gap-kiosk-4">
          <BackButtonSkeleton className="identity-back rounded-kiosk-sm text-kiosk-md" />
          <div className="identity-service-name w-full compact:w-auto compact:flex-1 bg-kiosk-primary-soft text-kiosk-primary p-kiosk-4 rounded-kiosk-sm text-kiosk-service-title font-bold leading-[1.4] wrap-anywhere">
            <Skeleton variant="text">
              {serviceName ?? t('services.service-1')}
            </Skeleton>
          </div>
        </div>
        <div className="identity-intro grid gap-kiosk-3 [&_h2]:text-kiosk-page-heading [&_h2]:font-extrabold [&_h2]:leading-[1.15] [&_h2]:tracking-[-0.025em] [&_p]:text-kiosk-text-muted [&_p]:text-kiosk-description [&_p]:leading-[1.4]">
          <h2>
            <Skeleton variant="text">{t('identity.pinTitle')}</Skeleton>
          </h2>
        </div>
        <div className="identity-methods flex flex-wrap gap-kiosk-2 [&_.button]:flex-1 [&_.button]:min-w-0 [&_.button]:text-kiosk-description [&_.button]:min-h-kiosk-12 [&_.button]:py-kiosk-2">
          <Skeleton
            variant="button"
            className="button border border-solid border-[transparent] rounded-kiosk-sm min-h-[56px] py-kiosk-3 px-kiosk-6 inline-flex items-center justify-center gap-kiosk-3 font-bold cursor-pointer leading-[1.3] no-underline [&:disabled]:cursor-not-allowed"
          >
            {t('identity.pinMethod')}
          </Skeleton>
          <Skeleton
            variant="button"
            className="button border border-solid border-[transparent] rounded-kiosk-sm min-h-[56px] py-kiosk-3 px-kiosk-6 inline-flex items-center justify-center gap-kiosk-3 font-bold cursor-pointer leading-[1.3] no-underline [&:disabled]:cursor-not-allowed"
          >
            {t('identity.passportMethod')}
          </Skeleton>
        </div>
        <IdentityDocumentGuide method="pin" loading />
      </div>
      <div className="identity-entry roomy:flex-1 min-w-0 flex flex-col gap-kiosk-6 col-start-2 row-start-1 self-stretch [&_.form-field]:min-w-0 [&_.field-error]:text-kiosk-description [&_.field-error]:leading-[1.4] [&_.field-error]:wrap-anywhere [[data-orientation='portrait']_&]:col-auto [[data-orientation='portrait']_&]:row-auto short:gap-kiosk-2 compact:col-auto compact:row-auto">
        <div className="compact:[&_.form-field]:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] compact:[&_.form-field]:items-center compact:[&_.form-field-label]:text-kiosk-description">
          <FormFieldSkeleton
            label={t('identity.pinLabel')}
            inputClassName={
              "identity-input py-kiosk-2 leading-tight short-wide:text-kiosk-sm min-h-kiosk-service-input rounded-kiosk-md text-center text-kiosk-page-heading font-bold tabular-nums [&:focus]:border-kiosk-primary [&.identity-input[aria-invalid='true']]:border-kiosk-danger [&.identity-input[aria-invalid='true']:focus-visible]:outline-kiosk-danger tracking-[0.08em] px-kiosk-3 [&::placeholder]:text-kiosk-text-muted [&::placeholder]:opacity-60 compact:text-kiosk-lg"
            }
            placeholder={t('identity.pinPlaceholder')}
          />
        </div>
        <div className="identity-keyboard-slot mt-auto w-full min-w-0">
          <div className="identity-keypad grid grid-cols-[repeat(3,_minmax(0,_1fr))] gap-kiosk-2 short-wide:gap-y-kiosk-1 mt-auto w-full shrink-0">
            {keys.map((key, index) => (
              <Skeleton
                key={index}
                variant="button"
                className={
                  index === 9 || index === 11
                    ? 'button border border-solid border-[transparent] inline-flex items-center justify-center gap-kiosk-3 font-bold cursor-pointer leading-[1.3] no-underline [&:disabled]:cursor-not-allowed identity-key min-h-kiosk-service-key rounded-kiosk-md p-kiosk-3 [&_svg]:w-kiosk-8 [&_svg]:h-kiosk-8 identity-key--action text-kiosk-md compact:text-kiosk-sm'
                    : 'button border border-solid border-[transparent] inline-flex items-center justify-center gap-kiosk-3 font-bold cursor-pointer leading-[1.3] no-underline [&:disabled]:cursor-not-allowed identity-key min-h-kiosk-service-key rounded-kiosk-md text-kiosk-2xl p-kiosk-3 [&_svg]:w-kiosk-8 [&_svg]:h-kiosk-8 compact:text-kiosk-xl'
                }
              >
                {key}
              </Skeleton>
            ))}
          </div>
        </div>
        <div className="button border border-solid border-[transparent] py-kiosk-3 px-kiosk-6 items-center justify-center gap-kiosk-3 font-bold leading-[1.3] no-underline [&:disabled]:cursor-not-allowed identity-continue [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6 [&_svg]:flex-none w-full min-h-kiosk-18 shrink-0 text-kiosk-lg [[data-orientation='portrait']_&]:col-auto [[data-orientation='portrait']_&]:row-auto compact:col-auto compact:row-auto skeleton bg-kiosk-surface-muted rounded-kiosk-sm animate-kiosk-skeleton pointer-events-none select-none [&.status-panel-icon]:rounded-kiosk-sm [&.service-card-arrow]:bg-kiosk-surface-muted [&.circle-arrow]:bg-kiosk-surface-muted [&.service-card-arrow]:rounded-kiosk-sm [&.circle-arrow]:rounded-kiosk-sm skeleton--button inline-flex cursor-default">
          <Skeleton variant="text">{t('identity.continue')}</Skeleton>
          <Skeleton variant="icon" />
        </div>
      </div>
    </div>
  );
}
