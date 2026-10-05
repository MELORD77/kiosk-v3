import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { ArrowIcon } from '@/shared/ui/arrow-icon';
import { ServiceFlowIcon } from './service-flow-icon';

interface IdentityMethodChoiceProps {
  serviceName: string;
  onBack: () => void;
  onManual: () => void;
  onReader: () => void;
}

export function IdentityMethodChoice({
  serviceName,
  onBack,
  onManual,
  onReader,
}: IdentityMethodChoiceProps) {
  const { t } = useTranslation();
  const methods = [
    { name: 'manual', icon: 'keyboard', onSelect: onManual },
    { name: 'reader', icon: 'passport', onSelect: onReader },
  ] as const;
  return (
    <section className="service-flow w-full max-w-[1440px] mx-auto flex flex-col gap-kiosk-6 short:gap-kiosk-4">
      <div className="flex items-center gap-kiosk-4 [&_svg]:w-kiosk-6 [&_svg]:h-kiosk-6">
        <Button variant="secondary" onClick={onBack}>
          <span className="flex rotate-180">
            <ArrowIcon />
          </span>
          {t('common.back')}
        </Button>
      </div>
      <div className="grid gap-kiosk-3 [&_h1]:text-kiosk-page-heading [&_h1]:font-extrabold [&_h1]:leading-[1.2] [&_p]:text-kiosk-description [&_p]:text-kiosk-text-muted">
        <h1>{t('serviceFlow.methodTitle')}</h1>
        <p>{serviceName}</p>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-kiosk-8 items-start [[data-orientation='portrait']_&]:grid-cols-1 compact:grid-cols-1">
        {methods.map(({ name, icon, onSelect }) => (
          <Button
            key={name}
            variant="secondary"
            className="w-full h-full flex flex-col items-start justify-start gap-kiosk-6 p-kiosk-8 text-left rounded-kiosk-md [&_.service-method-title]:text-kiosk-service-title [&_.service-method-description]:text-kiosk-description [&_.service-method-description]:font-normal [&_.service-method-description]:text-kiosk-text-muted"
            onClick={onSelect}
            aria-label={t(`serviceFlow.${name}Title`)}
          >
            <span className="w-kiosk-18 h-kiosk-18 p-kiosk-4 rounded-kiosk-md bg-kiosk-primary-soft text-kiosk-primary flex items-center justify-center [&_svg]:w-full [&_svg]:h-full shrink-0">
              <ServiceFlowIcon name={icon} />
            </span>
            <span className="service-method-title">
              {t(`serviceFlow.${name}Title`)}
            </span>
            <span className="service-method-description">
              {t(`serviceFlow.${name}Description`)}
            </span>
          </Button>
        ))}
      </div>
      <p className="rounded-kiosk-sm p-kiosk-4 bg-kiosk-surface-muted text-kiosk-text-muted text-kiosk-description">
        {t('serviceFlow.verificationNotice')}
      </p>
    </section>
  );
}
