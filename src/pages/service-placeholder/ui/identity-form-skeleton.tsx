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
      className="identity-form grid grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)] grid-rows-[auto_1fr] gap-x-kiosk-8 gap-y-kiosk-4 items-start w-full mx-auto [[data-orientation='portrait']_&]:flex [[data-orientation='portrait']_&]:flex-col [[data-orientation='portrait']_&]:items-stretch [[data-orientation='portrait']_&]:gap-kiosk-6 compact:flex compact:flex-col compact:items-stretch compact:gap-kiosk-4 identity-form-skeleton [&_.button]:cursor-default"
      aria-hidden="true"
    >
      <div className="identity-copy min-w-0 flex flex-col gap-kiosk-4 col-start-1 row-start-1 [[data-orientation='portrait']_&]:contents short:gap-kiosk-4 compact:contents">
        <div className="identity-navigation flex items-center justify-between gap-kiosk-4">
          <div className="button border border-solid border-[transparent] min-h-[56px] py-kiosk-3 px-kiosk-6 inline-flex items-center justify-center gap-kiosk-3 font-bold cursor-pointer leading-[1.3] no-underline [&:disabled]:cursor-not-allowed identity-back rounded-kiosk-sm text-kiosk-md [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6 [&_svg]:flex-none">
            <Skeleton variant="icon" />
            <Skeleton variant="text">{t('common.back')}</Skeleton>
          </div>
          <span className="identity-step text-kiosk-text-muted text-kiosk-md font-bold whitespace-nowrap">
            <Skeleton variant="text">{t('identity.stepCount')}</Skeleton>
          </span>
        </div>
        <div className="identity-progress grid grid-cols-[1fr_1fr] gap-kiosk-2 [&_span]:h-kiosk-2 [&_span]:rounded-kiosk-sm [&_span]:bg-kiosk-border [&_span:first-child]:bg-kiosk-primary [&_.skeleton]:bg-kiosk-surface-muted">
          <Skeleton variant="box" />
          <Skeleton variant="box" />
        </div>
        <div className="identity-service-name bg-kiosk-primary-soft text-kiosk-primary p-kiosk-4 rounded-kiosk-sm text-kiosk-service-title font-bold leading-[1.4] wrap-anywhere">
          <Skeleton variant="text">
            {serviceName ?? t('services.service-1')}
          </Skeleton>
        </div>
        <div className="identity-intro grid gap-kiosk-3 [&_h2]:text-kiosk-page-heading [&_h2]:font-extrabold [&_h2]:leading-[1.15] [&_h2]:tracking-[-0.025em] [&_p]:text-kiosk-text-muted [&_p]:text-kiosk-description [&_p]:leading-[1.4]">
          <h2>
            <Skeleton variant="text">{t('identity.pinTitle')}</Skeleton>
          </h2>
          <p>
            <Skeleton variant="text">{t('identity.pinHint')}</Skeleton>
          </p>
        </div>
        <div className="identity-methods flex flex-wrap gap-kiosk-2 [&_.button]:flex-1 [&_.button]:min-w-0 [&_.button]:text-kiosk-description">
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
      </div>
      <div className="identity-entry min-w-0 flex flex-col gap-kiosk-6 col-start-2 row-start-1 self-stretch [&_.form-field]:min-w-0 [&_.field-error]:text-kiosk-description [&_.field-error]:leading-[1.4] [&_.field-error]:wrap-anywhere [[data-orientation='portrait']_&]:col-auto [[data-orientation='portrait']_&]:row-auto short:gap-kiosk-4 compact:col-auto compact:row-auto">
        <FormFieldSkeleton
          label={t('identity.pinLabel')}
          inputClassName={
            "identity-input min-h-[96px] rounded-kiosk-md text-center text-kiosk-page-heading font-bold tabular-nums [&:focus]:border-kiosk-primary [&.identity-input[aria-invalid='true']]:border-kiosk-danger [&.identity-input[aria-invalid='true']:focus-visible]:outline-kiosk-danger tracking-[0.08em] px-kiosk-3 [&::placeholder]:text-kiosk-text-muted [&::placeholder]:opacity-60 [@media(height<=1000px)]:min-h-kiosk-18 compact:text-kiosk-lg compact:min-h-kiosk-18"
          }
          placeholder={t('identity.pinPlaceholder')}
        />
      </div>
      <div className="identity-keyboard-slot col-start-2 row-start-2 mt-auto w-full min-w-0 self-end order-last">
        <div className="identity-keypad grid grid-cols-[repeat(3,_minmax(0,_1fr))] gap-kiosk-3 mt-auto w-full shrink-0">
          {keys.map((key, index) => (
            <Skeleton
              key={index}
              variant="button"
              className={
                index === 9 || index === 11
                  ? 'button border border-solid border-[transparent] inline-flex items-center justify-center gap-kiosk-3 font-bold cursor-pointer leading-[1.3] no-underline [&:disabled]:cursor-not-allowed identity-key min-h-[96px] rounded-kiosk-md p-kiosk-3 [&_svg]:w-kiosk-8 [&_svg]:h-kiosk-8 [@media(1000px<height<=1100px)]:min-h-kiosk-18 [@media(height<=1000px)_and_(width>720px)]:min-h-[56px] compact:min-h-kiosk-16 identity-key--action text-kiosk-md compact:text-kiosk-sm'
                  : 'button border border-solid border-[transparent] inline-flex items-center justify-center gap-kiosk-3 font-bold cursor-pointer leading-[1.3] no-underline [&:disabled]:cursor-not-allowed identity-key min-h-[96px] rounded-kiosk-md text-kiosk-2xl p-kiosk-3 [&_svg]:w-kiosk-8 [&_svg]:h-kiosk-8 [@media(1000px<height<=1100px)]:min-h-kiosk-18 [@media(height<=1000px)_and_(width>720px)]:min-h-[56px] compact:text-kiosk-xl compact:min-h-kiosk-16'
              }
            >
              {key}
            </Skeleton>
          ))}
        </div>
      </div>
      <div className="button border border-solid border-[transparent] py-kiosk-3 px-kiosk-6 items-center justify-center gap-kiosk-3 font-bold leading-[1.3] no-underline [&:disabled]:cursor-not-allowed identity-continue [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6 [&_svg]:flex-none col-start-1 row-start-2 self-end w-full min-h-kiosk-18 mt-auto text-kiosk-lg [&.identity-continue:disabled]:text-kiosk-text-muted [&.identity-continue:disabled]:bg-kiosk-surface-muted [[data-orientation='portrait']_&]:col-auto [[data-orientation='portrait']_&]:row-auto compact:col-auto compact:row-auto skeleton bg-kiosk-surface-muted rounded-kiosk-sm animate-kiosk-skeleton pointer-events-none select-none [&.status-panel-icon]:rounded-kiosk-sm [&.service-card-arrow]:bg-kiosk-surface-muted [&.circle-arrow]:bg-kiosk-surface-muted [&.service-card-arrow]:rounded-kiosk-sm [&.circle-arrow]:rounded-kiosk-sm skeleton--button inline-flex cursor-default">
        <Skeleton variant="text">{t('identity.continue')}</Skeleton>
        <Skeleton variant="icon" />
      </div>
    </div>
  );
}
