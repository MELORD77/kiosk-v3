import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/classnames';
import { Button } from '@/shared/ui/button';
import { BackButton } from '@/shared/ui/back-button';
import { Badge } from '@/shared/ui/badge';
import { ServiceFlowIcon } from './service-flow-icon';

interface IdentityMethodChoiceProps {
  serviceName: string;
  onBack: () => void;
  onManual: () => void;
  onReader: () => void;
  onIdCard: () => void;
}

const methodTones = {
  manual: {
    card: 'from-kiosk-primary-soft/70 border-kiosk-primary/25 [&:enabled:hover]:border-kiosk-primary',
    icon: 'bg-kiosk-primary-soft text-kiosk-primary ring-kiosk-primary/20',
    decoration: 'text-kiosk-primary',
  },
  reader: {
    card: 'from-kiosk-success-soft/70 border-kiosk-success/25 [&:enabled:hover]:border-kiosk-success',
    icon: 'bg-kiosk-success-soft text-kiosk-success ring-kiosk-success/20',
    decoration: 'text-kiosk-success',
  },
  idCard: {
    card: 'from-kiosk-accent-soft/70 border-kiosk-accent/25 [&:enabled:hover]:border-kiosk-accent',
    icon: 'bg-kiosk-accent-soft text-kiosk-accent ring-kiosk-accent/20',
    decoration: 'text-kiosk-accent',
  },
} satisfies Record<
  'manual' | 'reader' | 'idCard',
  { card: string; icon: string; decoration: string }
>;

export function IdentityMethodChoice({
  serviceName,
  onBack,
  onManual,
  onReader,
  onIdCard,
}: IdentityMethodChoiceProps) {
  const { t } = useTranslation();
  const methods = [
    { name: 'manual', icon: 'keyboard', onSelect: onManual },
    { name: 'reader', icon: 'passport', onSelect: onReader },
    { name: 'idCard', icon: 'id-card', onSelect: onIdCard },
  ] as const;
  return (
    <section className="identity-method-choice service-flow w-full max-w-[1440px] mx-auto flex flex-col gap-kiosk-6 short:gap-kiosk-4">
      <div className="flex items-center gap-kiosk-4 [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6">
        <BackButton onClick={onBack} />
      </div>
      <div className="grid gap-kiosk-3 [&_h1]:text-kiosk-xl compact:[&_h1]:text-kiosk-page-heading [&_h1]:font-extrabold [&_h1]:leading-[1.2] [&_p]:text-kiosk-md compact:[&_p]:text-kiosk-description [&_p]:text-kiosk-text-muted">
        <h1>{t('serviceFlow.methodTitle')}</h1>
        <p>{serviceName}</p>
      </div>
      <div className="identity-method-grid grid roomy:flex-1 roomy:content-center grid-cols-[repeat(3,minmax(0,1fr))] gap-kiosk-8 short-wide:gap-kiosk-4 items-start [[data-orientation='portrait']_&]:grid-cols-1 compact:grid-cols-1">
        {methods.map(({ name, icon, onSelect }) => (
          <Button
            key={name}
            variant="secondary"
            className={cn(
              'relative isolate overflow-hidden w-full h-full flex flex-col compact:grid compact:grid-cols-[64px_minmax(0,1fr)] compact:gap-kiosk-4 compact:p-kiosk-6 items-start justify-start gap-kiosk-6 short-wide:gap-kiosk-3 p-kiosk-8 short-wide:p-kiosk-6 text-left rounded-kiosk-lg bg-linear-to-br via-kiosk-surface to-kiosk-surface shadow-kiosk-card [&_.service-method-title]:text-kiosk-lg compact:[&_.service-method-title]:text-kiosk-service-title [&_.service-method-description]:text-kiosk-md compact:[&_.service-method-description]:text-kiosk-description [&_.service-method-description]:font-normal [&_.service-method-description]:text-kiosk-text-muted',
              methodTones[name].card,
            )}
            onClick={onSelect}
            aria-label={t(`serviceFlow.${name}Title`)}
          >
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute top-kiosk-4 right-kiosk-4 size-40 compact:size-28 opacity-10 [&_svg]:size-full',
                methodTones[name].decoration,
              )}
            >
              <ServiceFlowIcon name={icon} />
            </span>
            <span
              className={cn(
                'relative compact:row-span-2 compact:size-16 size-20 p-3 rounded-kiosk-md ring-1 ring-inset flex items-center justify-center [&_svg]:size-full shrink-0',
                methodTones[name].icon,
              )}
            >
              <ServiceFlowIcon name={icon} />
            </span>
            <span className="service-method-title relative">
              {t(`serviceFlow.${name}Title`)}
            </span>
            <span className="service-method-description relative">
              {t(`serviceFlow.${name}Description`)}
            </span>
            {name === 'idCard' && (
              <Badge
                tone="primary"
                className="relative text-kiosk-xs compact:col-start-2 justify-self-start bg-kiosk-accent-soft text-kiosk-accent"
              >
                {t('serviceFlow.comingSoon')}
              </Badge>
            )}
          </Button>
        ))}
      </div>
      <p className="mt-auto rounded-kiosk-sm p-kiosk-4 bg-kiosk-surface-muted text-kiosk-text-muted text-center text-kiosk-md compact:text-kiosk-description">
        {t('serviceFlow.verificationNotice')}
      </p>
    </section>
  );
}
